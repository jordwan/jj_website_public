import React from "react";
import { Box, Button, Flex, Image, Link, Spacer } from "@chakra-ui/react";
import Facebook from "./assets/social-media-icons/facebook_32x32.png";
import Twitter from "./assets/social-media-icons/twitter_32x32.png";
import Email from "./assets/social-media-icons/email_32x32.png";

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
    <Flex justify="space-between" align="center" padding="30px">
      <Flex justify="space-around" padding="0 75px">
        <Link href="">
          <Image src={Facebook} boxSize="42px" margin="0 5px" />
        </Link>
        <Link href="">
          <Image src={Twitter} boxSize="42px" margin="0 5px" />
        </Link>
        <Link href="">
          <Image src={Email} boxSize="42px" margin="0 5px" />
        </Link>
      </Flex>

      <Flex justify="space-around" align="center" width="60%" padding="20px">
        <Box margin="0 15px"> About Me</Box>
        <Spacer />
        <Box margin="0 15px"> Portfolio </Box>
        <Spacer />

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
      </Flex>
    </Flex>
  );
};

export default NavBar;
