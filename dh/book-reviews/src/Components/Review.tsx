import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Rating from '@material-ui/lab/Rating';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { grey as GREY } from '@material-ui/core/colors';
import { BookReview } from '../SampleData';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      width: theme.spacing(4.5),
      height: theme.spacing(4.5),
    },
  }),
);

const formatDate = (date: string) => {
  const dateString = new Date(date).toDateString().slice(4);
  return dateString.replace(/(\w{3} \d+)/, '$1,');
};

export default function Review({ review }: { review: BookReview }) {
  const classes = useStyles();

  const helpfulRating = () => {
    const num = review.helpful[0];
    if (!num) {
      return;
    } else {
      return (
        <Box mt={2} color={GREY[600]}>
          {`${num} ${
            num === 1 ? 'person' : 'people'
          } found this review helpful`}
        </Box>
      );
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="start">
      <Box display="flex" alignItems="center">
        <Avatar className={classes.avatar}> {review.reviewerName[0]}</Avatar>
        <Box ml={1.5}>{review.reviewerName}</Box>
      </Box>
      <Box display="flex" alignItems="center" mt={0.5}>
        <Box
          component="fieldset"
          p={0}
          m={0}
          border={0}
          title={`${review.overall} out of 5`}
          display="flex"
        >
          <Rating
            name="read-only"
            title={`${review.overall} out of 5`}
            value={review.overall}
            readOnly
            size="small"
            precision={0.1}
          />
        </Box>
        <Box ml={1.5} fontWeight="fontWeightBold">
          {review.summary}
        </Box>
      </Box>
      <Box mt={0.5} color={GREY[800]}>
        Reviewed on
        {` ${formatDate(review.reviewTime)}`}
      </Box>
      <Box mt={2} textAlign="left">
        {review.reviewText}
      </Box>
      {helpfulRating()}
    </Box>
  );
}
