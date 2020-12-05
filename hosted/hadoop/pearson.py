import sys
import re
import math

# import numpy
from pyspark import SparkContext, SparkConf


# from pyspark.mllib.feature import HashingTF, IDF


def sep(line):
    words = line.split(",")
    asin = words[0]
    text = ",".join(words[1:])
    text = remove_punct(text)
    length = len(text.split(" "))
    return (asin, text)


def remove_punct(line):
    line = re.sub("['\".,!#]", "", line)
    line = re.sub(" +", " ", line)
    return line


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Invalid Number of Arguments")
        exit()

    url = sys.argv[1]  # ip:port

    conf = SparkConf().setAppName("Wordcount Application")
    sc = SparkContext(conf=conf)

    price = sc.textFile("hdfs://{}/input/metadata/*".format(url))
    price_dff = price.map(lambda line: line.split("\t")).map(
        lambda x: (x[0], float(x[1]))
    )

    reviews = sc.textFile("hdfs://{}/input/reviews/*".format(url))
    reviews_words = reviews.map(sep)

    reviews_dff = (
        reviews_words.map(lambda line: (line[0], [len(line[1].split(" ")), 1]))
        .reduceByKey(lambda a, b: [a[0] + b[0], a[1] + b[1]])
        .map(lambda x: (x[0], x[1][0] / x[1][1]))
    )

    merge = reviews_dff.join(price_dff)
    merge_dff = merge.filter(lambda x: len(x[1]) == 2)

    size = merge_dff.count()

    _, (sum_review_len, sum_price) = merge_dff.reduce(
        lambda a, b: ("a", (a[1][0] + b[1][0], a[1][1] + b[1][1]))
    )
    mean_review_len = float(sum_review_len) / size
    mean_price = float(sum_price) / size

    merge_dff = merge_dff.map(
        lambda x: (
            x[0],
            (
                (x[1][0] - mean_review_len) * (x[1][1] - mean_price),
                (x[1][0] - mean_review_len) ** 2,
                (x[1][1] - mean_price) ** 2,
            ),
        )
    )

    _, (top, bl, br) = merge_dff.reduce(
        lambda a, b: ("a", (a[1][0] + b[1][0], a[1][1] + b[1][1], a[1][2] + b[1][2]))
    )
    pearson = top / math.sqrt(bl) / math.sqrt(br)

    pearson_dff = sc.parallelize([pearson])
    pearson_dff.saveAsTextFile("hdfs://{}/output/pearson/".format(url))
    sc.stop()
