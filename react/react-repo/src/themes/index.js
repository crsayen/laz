import defaultTheme from "./default";

import { createMuiTheme } from "@material-ui/core";

const overrides = {
  typography: {
    fontFamily: [ 'Helvetica-Neue' ],
    h1: {
      fontSize: "3rem"
    },
    h2: {
      fontSize: "2rem"
    },
    h3: {
      fontSize: "1.64rem"
    },
    h4: {
      fontSize: "1.5rem"
    },
    h5: {
      fontSize: "1.285rem"
    },
    h6: {
      fontSize: "1.142rem"
    }
  },
  overrides: {
    MuiPaper: {
      root: {
        backgroundColor: "#ECECEC",
      }
    },
    MuiCard: {
      root: {
        boxShadow:
          "0px 3px 11px 0px #d9d9d9, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A"
      }
    },
    MUIDataTable: {
      paper: {
        boxShadow:
          "0px 3px 11px 0px #d9d9d9, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A"
      }
    },
    MuiBackdrop: {
      root: {
        backgroundColor: "#4A4A4A1A"
      }
    },
    MuiTab: {
      root: {
        width: "50%",
        minWidth: "150px",
        '@media (min-width: 600px)': {
          minWidth: "50%"
        }
      },
    },
    MuiMenu: {
      paper: {
        backgroundColor: "#ECECEC",
        boxShadow:
          "0px 3px 11px 0px #d9d9d9, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A"
      }
    },
    MuiSelect: {
      icon: {
        color: "#B3B3B3"
      }
    },
    MuiListItem: {
      root: {
        "&$selected": {
          backgroundColor: "#d9d9d9 !important",
          "&:focus": {
            backgroundColor: "#d9d9d9"
          }
        }
      },
      button: {
        "&:hover, &:focus": {
          backgroundColor: "#d9d9d9"
        }
      }
    },
    MuiTouchRipple: {
      child: {
        backgroundColor: "white"
      }
    },
    MuiTableRow: {
      root: {
        height: 56
      }
    },
    MuiDivider: {
      root: {
      backgroundColor: "#d4d4d4",
      opacity: 0.3
      }
    },
    MuiTableCell: {
      root: {
        borderBottom: "1px solid rgba(224, 224, 224, .5)",
        padding: "14px 40px 14px 24px"
      },
      head: {
        fontSize: "0.95rem"
      },
      body: {
        fontSize: "0.95rem"
      },
      paddingCheckbox: {
        padding: "0 0 0 15px"
      }
    }
  }
};

export default {
  default: createMuiTheme({ ...defaultTheme, ...overrides }),
};
