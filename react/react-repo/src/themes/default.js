import tinycolor from "tinycolor2";

const primary = "#1A281D";
const secondary = "#88A2A7";
const warning = "#D9B945";
const success = "#2B746C";
const info = "#DFDCD7";

const lightenRate = 7.5;
const darkenRate = 15;

export default {
  palette: {
    primary: {
      main: primary,
      light: tinycolor(primary)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(primary)
        .darken(darkenRate)
        .toHexString()
    },
    secondary: {
      main: secondary,
      light: tinycolor(secondary)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(secondary)
        .darken(darkenRate)
        .toHexString(),
      contrastText: "#ccc"
    },
    warning: {
      main: warning,
      light: tinycolor(warning)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(warning)
        .darken(darkenRate)
        .toHexString()
    },
    success: {
      main: success,
      light: tinycolor(success)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(success)
        .darken(darkenRate)
        .toHexString()
    },
    info: {
      main: info,
      light: tinycolor(info)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(info)
        .darken(darkenRate)
        .toHexString()
    },
    inherit: {
      main: "inherit",
      light: tinycolor("inherit")
        .lighten("inherit")
        .toHexString(),
      dark: tinycolor("inherit")
        .darken("inherit")
        .toHexString()
    },
    text: {
      primary: "#4A4A4A",
      secondary: "#6E6E6E",
      hint: "#B9B9B9"
    },
    background: {
      default: "#e8e6e3",
      light: "#efedeb"
    }
  },
  customShadows: {
    widget:
      "0px 3px 11px 0px #e8e6e3, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
    widgetDark:
      "0px 3px 18px 0px #e8e6e3, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
    widgetWide:
      "0px 12px 33px 0px #e8e6e3, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A"
  }
};
