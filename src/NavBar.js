import React from "react";
import { Box, Button } from "@chakra-ui/react";

const NavBar = ({ accounts, setAccounts }) => {
  const isConnected = Boolean(accounts[0]);

  async function connectAccount() {
    if (window.ethereum) {
      try {
        const connectedAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccounts(connectedAccounts);
      } catch (error) {
        console.error("Error connecting account:", error);
      }
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <Box margin="0 15px">
          <a href="/">About Me</a>
        </Box>
        <Box margin="0 15px">
          <a href="http://footyfiend.com/">Portfolio</a>
        </Box>
      </div>

      <div>
        <Button
          backgroundColor={isConnected ? "#D6517D" : "#476930"}
          borderRadius="5px"
          boxShadow="0 2px 2px 1px #0F0F0F"
          color="white"
          cursor="pointer"
          fontFamily="inherit"
          padding="10px 25px"
          margin="0 15px"
          onClick={isConnected ? undefined : connectAccount}
        >
          {isConnected ? "Connected" : "Connect Metamask"}
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
