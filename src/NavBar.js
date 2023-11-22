import React from "react";
import { Box, Button, Flex, Image, Link, Spacer } from "@chakra-ui/react";

const NavBar = ({ accounts, setAccounts }) => {
  const isConnected = Boolean(accounts[0]);

  async function connectAccount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccounts(accounts);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
          paddingRight: "10px",
        }}
      >
        <Box margin="0 15px"> About Me</Box>
        <Box margin="0 15px"> Portfolio </Box>

        {isConnected ? (
          <Button
            backgroundColor="#D6517D"
            borderRadius="5px"
            boxShadow="0 2px 2px 1px #0F0F0F"
            color="white"
            cursor="pointer"
            fontFamily="inherit"
            padding="10px 25px"
            margin="0 15px"
          >
            Connected
          </Button>
        ) : (
          <Button
            backgroundColor="#476930"
            borderRadius="5px"
            boxShadow="0 2px 2px 1px #0F0F0F"
            color="white"
            cursor="pointer"
            fontFamily="inherit"
            padding="10px 25px"
            margin="0 15px"
            onClick={connectAccount}
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
