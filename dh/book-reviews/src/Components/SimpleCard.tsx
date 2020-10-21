import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
  },
  action: {
    display: 'flex',
    justifyContent: 'end',
  },
});

interface CardProps {
  imgSrc?: string;
  bookTitle: string;
  bookId: string;
}

export default function SimpleCard(props: CardProps) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent className={classes.content}>
        <div style={{ textAlign: 'start' }}>
          <Typography variant="h6" style={{ marginBottom: '8px' }}>
            {props.bookTitle}
          </Typography>
          <Typography variant="caption">{props.bookId}</Typography>
        </div>
      </CardContent>
      <CardActions className={classes.action}>
        <Button size="small" component={Link} to={`book/${props.bookId}`}>
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}
