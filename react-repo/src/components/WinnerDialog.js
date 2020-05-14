import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Card from '@material-ui/core/Card'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';
import { Button } from '@material-ui/core';

function WinnerDialog(props) {
  const { onClose, userName, cards, open } = props;
  const handleClose = () => {
    onClose()
  }

  const makeCard = (card) => (
    <ListItem key={card.text}>
      <Card>
        {card.text}
      </Card>
    </ListItem>
  )

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">We have a winner!</DialogTitle>
        <div>{userName}</div>
        <List>
          {cards.map(makeCard)}
        </List>
      <Button onClick={onClose}>OK</Button>
    </Dialog>
  );
}

export default WinnerDialog