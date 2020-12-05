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


# def remove_punct(line):
#     return re.sub('[\'".,!#]','',line)


def tf(terms):
    """
    input
    terms :  a RDD of lists of terms (words)
    output
    a RDD of pairs i.e. (word, tf_score)
    """
    # TODO
    pairs = (
        terms.flatMap(lambda x: x)
        .map(lambda word: (word, 1))
        .reduceByKey(lambda a, b: a + b)
    )
    return pairs


def df(terms):
    """
    input
    terms :  a RDD of lists of terms (words)
    output
    a RDD of pairs i.e. (word, df_score)
    """
    # TODO
    df = (
        terms.flatMap(lambda x: set(x))
        .map(lambda word: (word, 1))
        .reduceByKey(lambda a, b: a + b)
    )
    return df


def tfidf(terms):
    """
    input
    terms:  a RDD of lists of terms (words)
    output
    a RDD of pairs i.e. (words, tfidf_score) sorted by tfidf_score in descending order.
    """
    # TODO
    tf_val = tf(terms)
    df_val = df(terms)
    tfidf_val = tf_val.join(df_val)
    num = terms.count()
    tfidf = tfidf_val.map(lambda x: (x[0], x[1][0] * math.log(num / x[1][1]))).sortBy(
        lambda x: -x[1]
    )
    # tfidf = tfidf_val.map(lambda x: (x[0],x[1][0]*math.log(num/x[1][1]))).sortBy(lambda a: a[1], ascending=False)
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

    # Load documents (one per line).
    documents = reviews_words.map(lambda line: line[1].split(" "))

    tfidf_dff = tfidf(documents)
    tfidf_dff.saveAsTextFile("hdfs://{}/output/tfidf/".format(url))
    sc.stop()
