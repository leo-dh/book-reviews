import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SimpleCard from '../Components/SimpleCard';
import { METADATA } from '../SampleData';
import Box from '@material-ui/core/Box';

const metaData = METADATA;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardContainer: {
      display: 'grid',
      width: '100%',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gridAutoRows: '1fr',
      gap: `${theme.spacing(2)}px`,
    },
  }),
);
export default function Home() {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column" maxWidth="100%" padding={2}>
      <Typography variant="h4" align="left" style={{ marginBottom: '16px' }}>
        Books
      </Typography>
      <div className={classes.cardContainer}>
        {metaData.map((book, idx) => {
          return (
            <SimpleCard bookId={book.asin} bookTitle={book.title} key={idx} />
          );
        })}
      </div>
    </Box>
  );
}
