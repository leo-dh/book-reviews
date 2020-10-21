import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { METADATA, reviews } from '../SampleData';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Rating from '@material-ui/lab/Rating';
import Chip from '@material-ui/core/Chip';
import Review from '../Components/Review';

interface ReviewParams {
  asin: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    imageCover: {
      height: '300px',
      width: '300px',
      flexShrink: 0,
    },
    genreContainer: {
      display: 'flex',
      justifyContent: 'start',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
      marginLeft: theme.spacing(-0.5),
    },
    reviewsContainer: {
      '& > *': {
        marginTop: theme.spacing(5),
        marginBottom: theme.spacing(5),
      },
    },
  }),
);

const useMetaData = (asin: string) => {
  return METADATA.find((book) => book.asin === asin);
};
const useReviews = (asin: string) => {
  return reviews.find((book) => book.asin === asin);
};

export default function Book({ match }: RouteComponentProps<ReviewParams>) {
  const classes = useStyles();
  const {
    params: { asin },
  } = match;

  const bookDetails = useMetaData(asin);
  const bookReviews = useReviews(asin);

  if (!bookDetails) {
    return <div>ASIN: {asin} cannot be found.</div>;
  }
  const rating = bookReviews
    ? bookReviews.overallRating / bookReviews.reviews.length
    : 0;
  const genres = bookDetails.categories.reduce((all, currentValue) => {
    currentValue.forEach((genre) => {
      if (!all.includes(genre)) {
        all.push(genre);
      }
    });
    return all;
  }, []);

  return (
    <Box display="flex" justifyContent="center" py={2}>
      <Box display="flex" width="100%" maxWidth="1024px" flexDirection="column">
        <Box display="flex" alignItems="center">
          <img src={bookDetails.imUrl} alt="" className={classes.imageCover} />
          <Box display="flex" flexDirection="column" ml={2} alignItems="start">
            <Typography variant="h5" align="left">
              <Box fontWeight="fontWeightBold">{bookDetails.title}</Box>
            </Typography>
            <Typography variant="subtitle1" align="left">
              <Box mt={1}>By {bookDetails.author}</Box>
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Box
                component="fieldset"
                p={0}
                m={0}
                border={0}
                title={`${rating} out of 5`}
                display="flex"
              >
                <Rating
                  name="read-only"
                  title={`${rating} out of 5`}
                  value={rating}
                  readOnly
                  precision={0.1}
                />
              </Box>
              <Box ml={2} fontSize="1rem">
                {bookReviews?.reviews.length || 0} ratings
              </Box>
            </Box>
            <Box mt={3} textAlign="left">
              {bookDetails.description || 'No Description Provided.'}
            </Box>
            <Box textAlign="start" mt={3} className={classes.genreContainer}>
              {genres.map((genre, idx) => (
                <Chip label={genre} variant="outlined" key={idx} />
              ))}
            </Box>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="start" mt={4}>
          <Typography variant="h5">
            <Box fontWeight="fontWeightBold">Reviews</Box>
          </Typography>
          <Box className={classes.reviewsContainer}>
            {bookReviews?.reviews.map((review, idx) => (
              <Review key={idx} review={review} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
