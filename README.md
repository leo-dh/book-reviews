## Usage

First, create a `config` file in the `/home/ubuntu` directory and set the desired configuration.

The settings available for configuration are shown in the table below.

| Name                       | Description                                                  | Default     |
| -------------------------- | ------------------------------------------------------------ | ----------- |
| `aws_access_key_id`        | Required. Your AWS access key.                               |             |
| `aws_secret_access_key`    | Required. Your AWS secret key.                               |             |
| `aws_session_token`        | Your AWS session token, if any.                              |             |
| `region_name`              | Either `us-east-1` or `ap-southeast-1`.                      | `us-east-1` |
| `production_instance_size` | Size of production instance.                                 | `t2.medium` |
| `hadoop_instance_size`     | Size of Hadoop instance.                                     | `t2.medium` |
| `hadoop_worker_nodes`      | Number of worker nodes for Hadoop cluster, excluding name node. | `3`         |
| `hadoop_volume_size`       | Volume size of Hadoop instances in GiB.                      | `8`         |

For example, if we want our Hadoop instances to be t2.large with 16 GiB volume size, the config file would look like this:

```
aws_access_key_id=......
aws_secret_access_key=......

hadoop_instance_size=t2.large
hadoop_volume_size=16
```

Once configuration is complete, run the command  `curl https://dbs.xuliang.dev/master/setup.sh | bash` to perform the setup. Setup typically takes about 5-6 minutes.

To shut down all systems, run `python3.7 teardown.py`.

To perform data ingestion into HDFS and/or analytics tasks, run `python3.7 analytics.py` with either or both of the flags `--ingest` and `--run`.

To scale the analytics cluster up or down, run `python3.7 scale.py [num_worker_nodes]`.

## Behind the scenes

Automation scripts (contained within the `hosted` folder on this repository) are hosted on `https://dbs.xuliang.dev` and retrieved by other scripts when required for ease of access.

```
hosted
└─── django
│    └─── launch.sh            script to start the Django server
│    └─── migrate.sh           script to make database migrations and create indexes
│    └─── setup.sh             script to install dependencies on Django server
│    └─── source.tar.gz        tar file containing Django server and static frontend
└─── hadoop
│    └─── analytics.sh         script to install and configure Hadoop
│    └─── ingest.sh            script to ingest data into HDFS     
│    └─── pearson.py           Spark script to compute pearson correlation
│    └─── remove_schedule.sh   script to unschedule data ingestion
│    └─── schedule.sh          script to schedule data ingestion
│    └─── setup.sh             script to install and configure Hadoop
│    └─── spark.sh             script to install and configure Spark
│    └─── tfidf.py             Spark script to compute TF-IDF
│    └─── utils.sh             script to install ingestion utilities
└─── master
│    └─── analytics.py         script to perform ingestion or analytics tasks
│    └─── automate.py          module containing automation task methods
│    └─── launch.py            script to start production and analytics clusters
│    └─── scale.py             script to scale analytics cluster
│    └─── setup.sh             script to install dependencies and set up all clusters
│    └─── teardown.py          script to tear down clusters
└─── mongo
│    └─── setup.sh             script to install MongoDB and ingest metadata data
└─── mysql
│    └─── ingestion.sql        script to ingest reviews data
│    └─── setup.sh             script to install MySQL
```

Additionally, the two metadata and reviews data files used by the automation scripts are hosted on S3 at https://database-project-public.s3.amazonaws.com/kindle_reviews.csv and https://database-project-public.s3.amazonaws.com/kindle_metadata_stream.json. A JAR file use to ingest data from MongoDB is also hosted at https://leodh.s3.amazonaws.com/MongoImport.jar, the file has been precompiled with the dependencies it requires.

The `frontend` and `server` folders respectively contain the source code for the frontend and Django server.

### Architecture

#### Production Cluster Architecture

The production cluster consists of three instances.

* Django
  * Hosts a Django server that interacts with the MySQL and MongoDB servers, and serves an API for the frontend.
  * Hosts an Nginx server that serves static frontend assets, and provides a reverse proxy to the Django server.
* MySQL
  * Hosts a MySQL 5.7 server that stores book reviews.
* MongoDB
  * Hosts a MongoDB 4.4 server that stores book metadata and access logs.

![](https://xuliang.dev/static/production.svg)

The production systems operate on JAMstack principles. The frontend is composed of static assets compiled with Gatsby  written in TypeScript and React. The frontend performs API queries to the Django server as required to retrieve data and make requests. The Django server also functions as a logger by reading information from the Nginx access logs and uploading them to the document store.

##### Frontend Features

* Search for a book by its title or author
* Find books by their genres
* List all books
* View individual books and their reviews
* Add a new book
* Add a new review

#### Analytics Cluster Architecture

The Hadoop cluster consists of one name node and (by default) three worker nodes. All nodes have an identical setup and configuration, and run on Hadoop 3.3.0 and Spark 3.0.1.

### Automation Process Flow

The automation scripts run on Python 3.7,  and use the Boto3 library for infrastructure configuration as well as the Paramiko library for communication with instances.

When the setup command `curl https://dbs.xuliang.dev/master/setup.sh | bash` is run, the necessary dependencies and libraries are retrieved and installed. Once this is done, the launch script is called. The launch script first generates an SSH key pair, then provisions a number of security groups.

With the exception of the Django instance, which additionally allows for HTTP traffic on port 80, all instances have two security groups: one which allows inbound SSH connections on port 22 from anywhere, and another which allows inbound TCP connections on all ports from all other instances within the security group.

The launch script then runs the process flows for the production cluster and analytics cluster in parallel. When both operations are complete, it returns the location of the webserver.

#### Production Cluster Setup Process Flow

1. Three instances, one for the Django server, one for the MySQL server, and one for the MongoDB server are first provisioned. Once they are running, their details are saved to a `production_hosts.json` file.
2. An SSH connection is established to each of the instances. Passwords are generated for the MongoDB and MySQL servers.
3. Setup scripts are run for the respective instances in parallel.
   * Django server: Python 3.7 and the dependencies for the Django server are installed, together with Nginx. The tar file containing Django source code and the static frontend assets is retrieved and extracted.
   * MySQL server: MySQL 5.7 is installed. A `reviews` database is created, and a user is created with the username and password provided by the master instance.
   * MongoDB server: MongoDB 4.4 is installed. The metadata dataset is downloaded and ingested to the MongoDB server. A user is created with the username and password provided by the master instance.
4. Once all of the setup scripts have completed, the credentials and hosts for the MongoDB and MySQL databases are injected into the Django server as a  `.env` file.
5. The `migrate.sh` is run on the Django server. This script creates the reviews table in the MySQL database according to the Django ORM definition, and also creates indexes for the MongoDB database.
6. The `ingestion.sql` script is run on the MySQL server. This script uploads all the data from the reviews dataset to the relational database.
7. Finally, the `launch.sh` script is run on the Django server to start serving the frontend, and the SSH connections with the three instances are closed.

#### Analytics Cluster Setup Process Flow

1. `hadoop_worker_nodes` + 1 instances are first provisioned. Once they are running, their details are saved to a `hadoop_hosts.json` file.
2. An SSH connection is established to each of the instances.
3. A Hadoop setup script which takes the IP address of the master node as an input is run for all of the instances in parallel. Hadoop 3.3.0 is installed together with Spark 3.0.1, and the necessary configuration is performed.
4. Once Hadoop has been set up on all of the nodes, an SSH key pair is generated on the master node. The public key is added to the authorized keys in all of the nodes.
5. The IP addresses of the worker nodes are written to the relevant Hadoop and Spark configuration files on the master node. The name node is then formatted.
6. Finally, the Hadoop cluster is started from the master node, and the SSH connections with all of the instances are closed.

#### Hadoop Cluster Scaling Process Flow

1. The Hadoop cluster is first stopped from the master node.
   * If the cluster is being scaled down, worker node instances are terminated until the desired number of worker nodes remain.
   * If the cluster is being scaled up, a similar process to the analytics cluster setup process flow is followed.
     1. The required number of instances is first provisioned.
     2. The Hadoop and Spark setup scripts is run on each of the instances, and the master node's public key is added to their authorized keys file.
2. The `hadoop_hosts.json` file is updated with the new set of Hadoop node instances.
3. The IP addresses of the new set of worker nodes are written to the relevant Hadoop and Spark configuration files on the master node.
4. Finally, the Hadoop cluster is restarted from the master node.

#### Analytics Task (Calculating Pearson Correlation) Flow

1. Get the data in the reviews (format: "asin, review_text") and price data (format: "asin\tprice") in the form of a text file
2. Remove punctuations from the review text and split the data into the form of (asin, review_text_list) and (asin, price)
3. For reviews (asin, review_text_list), for each review, find the number of words then find the average review length for each book using reduceByKey
3. Merge the reviews dff and the price dff using join by their asin key (format: asin, (average_review_length, price))
4. Filter out all values without either average_review_length or price
5. Get the mean of the average_review_length and the mean of the price for each book using reduce
6. Using the pearson correlation coefficient formula, calculate the coefficient using reduce
7. Output result into a textfile on the hdfs
8. Grab the result from hdfs and output into a textfile on the namenode server
