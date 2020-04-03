import React from "react";
import { Popper, Divider, Box } from "@material-ui/core";
//import useStyles from "../styles";
import Widget from "../../../components/Widget";
import { Typography, Button } from "../../../components/Wrappers";


function SettingsPopper({ open, id, anchorEl }) {
  //const classes = useStyles();

  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement={"left-start"}
      style={{ zIndex: 100 }}
      elevation={4}
    >
      <Widget disableWidgetMenu>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
        >
          <>
            <Typography variant="body2" weight={"bold"} uppercase>
              Game Controls
            </Typography>
              <Box display="flex" justifyContent="space-between">
              <Button style={{ margin: 5 }} color="primary" variant="contained">New</Button>
              <Button style={{ margin: 5 }} color="primary" variant="contained">Start</Button>
              </Box>
          </>
          <Divider style={{ width: "100%", margin: "8px 0 16px 0" }} />
          <>
            <Typography variant="body2" weight={"bold"} uppercase>
              Existing Games
            </Typography>
          </>
          <Button
            color={"success"}
            variant={"contained"}
            style={{ width: "100%", marginTop: 8, marginBottom: 8 }}
          >
            Explorer
          </Button>
          <Button
            color={"primary"}
            variant={"contained"}
            style={{ width: "100%" }}
          >
            Join
          </Button>
        </Box>
      </Widget>
    </Popper>
  );
}

export default React.memo(SettingsPopper, (prevProps, nextProps) => {
  return prevProps.anchorEl === nextProps.anchorEl;
});
