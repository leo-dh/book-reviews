package com.mongoimport.tool;

import java.io.*;
import org.apache.commons.logging.*;
import org.apache.hadoop.conf.*;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.lib.output.*;
import org.apache.hadoop.mapreduce.*;
import org.bson.*;
import com.mongodb.hadoop.*;
import com.mongodb.hadoop.util.*;

public class MongoImport {
  private static final Log log = LogFactory.getLog(MongoImport.class);

  public static class MetadataMapper extends Mapper<Object, BSONObject, Text, Text> {
    @Override
    public void map(Object key, BSONObject value, Context context)
        throws IOException, InterruptedException {

      String price, asin;

      if (value.containsField("price")) {
        price = value.get("price").toString();
      } else {
        return;
      }
      asin = value.get("asin").toString();
      context.write(new Text(asin), new Text(price));

    }

  }



  public static void main(String[] args) throws Exception {
    String mongoUri = String.format("mongodb://%s/database.metadata?authSource=admin&w=1", args[0]);
    final Configuration conf = new Configuration();
    MongoConfigUtil.setInputURI(conf, mongoUri);
    MongoConfigUtil.setCreateInputSplits(conf, false);

    Job job = Job.getInstance(conf, "Mongo Import");

    Path out = new Path("/input/metadata");
    FileOutputFormat.setOutputPath(job, out);
    job.setJarByClass(MongoImport.class);
    job.setMapperClass(MetadataMapper.class);
    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(Text.class);

    job.setInputFormatClass(MongoInputFormat.class);
    job.setOutputFormatClass(TextOutputFormat.class);

    job.setNumReduceTasks(0);

    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}
