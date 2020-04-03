import express from "express";
import helpers from "../helpers/helpers";

const router = express.Router();

router.post('/signin/local', (req, res) => {
        const body = {
          id: "user",
          email: "user@email.com"
        };
        const user = body
        const token = helpers.jwtSign({user: body});
        const expire = (Date.now() + 18000000000);
        res.json({
          user,
          success: true,
          token,
          expire
        })

    });

module.exports = router;
