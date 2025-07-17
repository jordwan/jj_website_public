import { useState } from "react";
import { ethers } from "ethers";
import squirrelyMonzNFT from "./SquirrelyMonzNFT.json";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
const squirrelyMonzNFTAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "0xa3E46535052Ec3677dB3867b65B4b33889D4733B";

const MainMint = ({ accounts, setAccounts }) => {
  const [mintAmount, setMintAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isConnected = Boolean(accounts[0]);

  async function handleMint() {
    setError("");
    
    // Validate mint amount
    if (!Number.isInteger(mintAmount) || mintAmount < 1 || mintAmount > 3) {
      setError("Please select between 1 and 3 NFTs to mint");
      return;
    }
    
    if (!window.ethereum) {
      setError("Please install MetaMask to mint NFTs");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        squirrelyMonzNFTAddress,
        squirrelyMonzNFT.abi,
        signer
      );
      
      const response = await contract.mint(mintAmount, {
        value: ethers.parseEther((0.001 * mintAmount).toString()),
      });
      
      console.log("Minting...", response.hash);
      await response.wait();
      console.log("Minted successfully!");
      setError(""); // Clear any errors
    } catch (err) {
      console.error("Minting error:", err);
      
      // User-friendly error messages
      if (err.code === 4001) {
        setError("Transaction cancelled by user");
      } else if (err.code === -32603) {
        setError("Insufficient funds for minting");
      } else if (err.message?.includes("exceeds allowance")) {
        setError("Mint amount exceeds per-wallet limit");
      } else if (err.message?.includes("exceed collection size")) {
        setError("Not enough NFTs remaining in collection");
      } else {
        setError("Minting failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleDecrement = () => {
    if (mintAmount <= 1) return;
    setMintAmount(mintAmount - 1);
  };
  const handleIncrement = () => {
    if (mintAmount >= 3) return;
    setMintAmount(mintAmount + 1);
  };

  return (
    <Flex justify="center" align="center" height="100vh" paddingBottom="250px">
      <Box width="720px">
        <div>
          <Text fontSize="2em" textShadow="0 0px 2px #ffffff" color="#FF5733">
            Jordwan.com
          </Text>
          <Text
            fontSize="40px"
            color="#096066"
            letterSpacing="-5.5%"
            fontFamily="VT323"
            textShadow="0 0px 2px #ffffff"
          >
            Web Development / Blockchain
          </Text>
        </div>
        {isConnected ? (
          <div>
            <Flex align="center" justify="center">
              <Button
                backgroundColor="#D6517D"
                borderRadius="5px"
                boxShadow="0 2px 2px 1px #0F0F0F"
                color="white"
                cursor="pointer"
                fontFamily="inherit"
                padding="15px"
                marginTop="10px"
                onClick={handleDecrement}
              >
                -
              </Button>
              <Input
                readOnly
                fontFamily="inherit"
                width="100px"
                height="40px"
                textAlign="center"
                paddingLeft="19px"
                marginTop="10px"
                type="number"
                value={mintAmount}
              />
              <Button
                backgroundColor="#D6517D"
                borderRadius="5px"
                boxShadow="0 2px 2px 1px #0F0F0F"
                color="white"
                cursor="pointer"
                fontFamily="inherit"
                padding="15px"
                marginTop="10px"
                onClick={handleIncrement}
              >
                +
              </Button>
            </Flex>
            <Button
              backgroundColor="#D6517D"
              borderRadius="5px"
              boxShadow="0 2px 2px 1px #0F0F0F"
              color="white"
              cursor="pointer"
              fontFamily="inherit"
              padding="15px"
              marginTop="10px"
              onClick={handleMint}
              isLoading={isLoading}
              loadingText="Minting..."
              disabled={isLoading}
            >
              {isLoading ? "Minting..." : "Mint NFT"}
            </Button>
            {error && (
              <Text color="red.500" mt={2} fontSize="sm">
                {error}
              </Text>
            )}
          </div>
        ) : (
          <a
            href="mailto:info@jordwan.com?subject=Website Inquiry"
            target="_blank"
            rel="noreferrer"
          >
            <Text
              marginTop="0px"
              fontSize="30px"
              letterSpacing="-5.5%"
              fontFamily="VT323"
              textShadow="0 0px 2px #ffffff"
              color="#D8A12A"
            >
              info@jordwan.com
            </Text>
          </a>
        )}
      </Box>
    </Flex>
  );
};

export default MainMint;

/*  <Link href="/">
<Image
src="./assets/social-media-icons/facebook_32x32.png"
boxSize="42px"
margin="0 5px"
/>
</Link>
<Link href="/">
<Image
src="./assets/social-media-icons/facebook_32x32.png"
boxSize="42px"
margin="0 5px"
/>
</Link>
<Link href="/">
<Image
src="./assets/social-media-icons/facebook_32x32.png"
boxSize="42px"
margin="0 5px"
/>
</Link>
*/
