import sys
import re
import math
from pyspark import SparkContext, SparkConf

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

def tf(terms):
    pairs = (
        terms.flatMap(lambda x: x)
        .map(lambda word: (word, 1))
        .reduceByKey(lambda a, b: a + b)
    )
    return pairs


def df(terms):
    df = (
        terms.flatMap(lambda x: set(x))
        .map(lambda word: (word, 1))
        .reduceByKey(lambda a, b: a + b)
    )
    return df


def tfidf(terms):
    tf_val = tf(terms)
    df_val = df(terms)
    tfidf_val = tf_val.join(df_val)
    num = terms.count()
    tfidf = tfidf_val.map(lambda x: (x[0], x[1][0] * math.log(num / x[1][1]))).sortBy(
        lambda x: -x[1]
    )
    return tfidf


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Invalid Number of Arguments")
        exit()

    url = sys.argv[1]

    conf = SparkConf().setAppName("Wordcount Application")
    sc = SparkContext(conf=conf)
    reviews = sc.textFile("hdfs://{}/input/reviews/*".format(url))
    reviews_words = reviews.map(sep)

    documents = reviews_words.map(lambda line: line[1].split(" "))

    tfidf_dff = tfidf(documents)
    tfidf_dff.saveAsTextFile("hdfs://{}/output/tfidf/".format(url))
    sc.stop()
