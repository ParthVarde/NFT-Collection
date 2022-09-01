import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import { useRef, useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
    const [walletConnected, setWalletConnected] = useState(false);
    const [preSaleStarted, setPreSaleStarted] = useState(false);
    const [preSaleEnded, setPreSaleEnded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
    const web3ModalRef = useRef();

    const preSaleMint = async () => {
      try {
        const signer = await getProviderOrSigner(true);
        const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
        const tx = await whitelistContract.preSaleMint({ value: utils.parseEther("0.001") });
        setLoading(true);
        await tx.wait();
        setLoading(false);
        window.alert("You have successfully minted a Crypto Dev!");
      } catch(error) {
        console.log(error);
      }
    }

    const publicMint = async () => {
      try {
        const signer = await getProviderOrSigner(true);
        const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
        const tx = await whitelistContract.mint({ value: utils.parseEther("0.001") });
        setLoading(true);
        await tx.wait();
        setLoading(false);
        window.alert("You have successfully minted a Crypto Dev!");
      } catch(error) {
        console.log(error);
      }
    }

    const connectWallet = async () => {
      try {
        await getProviderOrSigner();
        setWalletConnected(true);
      } catch(error) {
        console.log(error);
      }
    }

    const startPreSale = async () => {
      try {
        const signer = await getProviderOrSigner(true);
        const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
        const tx = await whitelistContract.startPreSale();
        setLoading(true);
        await tx.wait();
        setLoading(false);
        await checkIfPresaleStarted();
      } catch(error) {
        console.log(error);
      }
    }

    const checkIfPresaleStarted = async () => {
      try {
        const provider = await getProviderOrSigner();
        const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        const tx = await whitelistContract.preSaleStarted();
        if(!tx) {
          await getOwner();
        }
        setPreSaleStarted(tx);
        return tx;
      } catch(error) {
        console.log(error);
        return false;
      }
    }

    const checkIfPreSaleEnded = async () => {
      try {
        const provider = await getProviderOrSigner();
        const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        const tx = await whitelistContract.preSaleEnded();
        const hasEnded = tx.lt(Math.floor(Date.now() / 1000));
        if(hasEnded) {
            setPreSaleEnded(true);
        }
        else {
            setPreSaleEnded(false);
        }
        return hasEnded;
      } catch(error) {
        console.log(error);
        return false;
      }
    }

    const getOwner = async () => {
      try {
        const provider = await getProviderOrSigner();
        const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        const _owner = await whitelistContract.owner();
        const signer = await getProviderOrSigner(true);
        const address = await signer.getAddress();
        if(address.toLowerCase() === _owner.toLowerCase()) {
          setIsOwner(true);
        }
      } catch(error) {
        console.log(error);
      }
    }

    const getTokenIdsMinted = async () => {
      try {
        const provider = await getProviderOrSigner();
        const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        const _tokenIds = await whitelistContract.tokenIds();
        setTokenIdsMinted(_tokenIds.toString());
      } catch(error) {
        console.log(error);
      }
    }

    const getProviderOrSigner = async (needSigner = false) => {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = await new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 4) {
        window.alert("Change the network to Rinkeby");
        throw new Error("Change network to Rinkeby");
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    }

    useEffect(() => {
      if (!walletConnected) {
        web3ModalRef.current = new Web3Modal({
          network: "rinkeby",
          providerOptions: {},
          disableInjectedProvider: false,
        });
        connectWallet();
  
        const _preSaleStarted = checkIfPresaleStarted();
        if (_preSaleStarted) {
          checkIfPreSaleEnded();
        }
  
        getTokenIdsMinted();
  
        const preSaleEndedInterval = setInterval(async function () {
          const _preSaleStarted = await checkIfPresaleStarted();
          if (_preSaleStarted) {
            const _preSaleEnded = await checkIfPreSaleEnded();
            if (_preSaleEnded) {
              clearInterval(preSaleEndedInterval);
            }
          }
        }, 5 * 1000);

        setInterval(async function () {
          await getTokenIdsMinted();
        }, 5 * 1000);
      }
    }, [walletConnected]);

    const renderButton = () => {
      if (!walletConnected) {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        );
      }
  
      if (loading) {
        return <button className={styles.button}>Loading...</button>;
      }
  
      if (isOwner && !preSaleStarted) {
        return (
          <button className={styles.button} onClick={startPreSale}>
            Start Presale!
          </button>
        );
      }
  
      if (!preSaleStarted) {
        return (
          <div>
            <div className={styles.description}>Presale hasn't started!</div>
          </div>
        );
      }
  
      if (preSaleStarted && !preSaleEnded) {
        return (
          <div>
            <div className={styles.description}>
              Presale has started!!! If your address is whitelisted, Mint a
              Crypto Dev 🥳
            </div>
            <button className={styles.button} onClick={preSaleMint}>
              Presale Mint 🚀
            </button>
          </div>
        );
      }
  
      if (preSaleStarted && preSaleEnded) {
        return (
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
        );
      }
    };
    
    return (
      <div>
        <Head>
          <title>Crypto Devs</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
            <div className={styles.description}>
              Its an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/20 have been minted
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./cryptodevs/0.svg" />
          </div>
        </div>
  
        <footer className={styles.footer}>
          Made with &#10084; by Crypto Devs
        </footer>
      </div>
    );
}