import React, { useCallback, useRef } from "react";
import { Header, Footer, MailingList } from "../components/index";
import { Container, Row, Col } from "react-bootstrap";
import { BannerLogo } from "../components/images";

import { crowdsale_addr, trapDart_addr } from "../contract/addresses";
import CrowdsaleABI from "../contract/Crowdsale.json";
import CrowdsaleABI2 from "../contract/Crowdsale2.json";
import TrapdatABI from "../contract/TrapDart.json";
import moment from "moment";

import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState, Ref } from "react";

import Web3Modal from "web3modal";
import apis from "../services";
import Web3 from "web3";

const node =
  `${process.env.REACT_APP_ETH_NODE}` + `${process.env.REACT_APP_ALCHEMY_API}`;
const provider = new ethers.providers.JsonRpcProvider(node);

function Home() {
  const [_value, setValue] = useState(0);
  const [data, setData] = useState({});
  const [text, setText] = useState('');

  // const [update , setUpdate] = useState(0);
  const [whitelist, setWhitelist] = useState(
    "Not eligible - check Twitter or Telegram to get whitelisted."
  );
  // const [whitelistCheck , setWhitelistCheck] = useState(false)

  const update = useRef(0);

  const {
    connector,
    library,
    account,
    chainId,
    activate,
    deactivate,
    active,
    errorWeb3Modal,
  } = useWeb3React();

  const [lib, setLib] = useState(() => {
    // console.log("%%%%%%%% USE EFFECT %%%%%%%%%%");
    // console.log(library, "%%%%%%%");

    if (library) {
      return provider;
    } else {
      return provider;
    }
  });

  const status = useWeb3React();

  // console.log(status, "%$%%%%%%");

  console.log("%%%%%%%% LIBRARY %%%%%%%%%%", lib);

  const node =
    `${process.env.REACT_APP_ETH_NODE}` +
    `${process.env.REACT_APP_ALCHEMY_API}`;
  // const provider = new ethers.providers.JsonRpcProvider(node);

  const loadProvider = async () => {
    try {
      if (active) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        return provider.getSigner();
      } else {
        //  return
      }
    } catch (e) {
      console.log("loadProvider: ", e);
    }
  };

  const getText = async ()=>{
    try {
      const response = await apis.getText()
      console.log("getText" , response)
      setText(response.data.title)
    } catch (error) {
      console.log("getText" , error)
    }
  }

  const getRoundPrice = async (signer) => {
    try {
      
      let NFTCrowdsaleContract = new ethers.Contract(
        crowdsale_addr,
        CrowdsaleABI,
        signer
      );
      let TrapdartContract = new ethers.Contract(
        trapDart_addr,
        TrapdatABI,
        signer
      );

      let _account = account;
      if (!account) {
        _account = "0x0000000000000000000000000000000000000000";
      }
      console.log("_payees", _account);
      let _payees = await NFTCrowdsaleContract._payees(_account);
      console.log("_payees", _payees);

      setWhitelist(
        _payees
          ? "You are whitelisted!"
          : "Not eligible - check Twitter or Telegram to get whitelisted."
      );

      try {
        let round;
        try {
          round = (await NFTCrowdsaleContract._currentRound()).toString();
        } catch (error) {
          round = "0";
        }
        let _price = await NFTCrowdsaleContract.getRoundPrice(round);
        let _min = await NFTCrowdsaleContract.minBuy();
        let _max = await NFTCrowdsaleContract.maxBuy();
        let time = await NFTCrowdsaleContract.getRoundEndTime(round);
        let startTime = await NFTCrowdsaleContract.round_startingUnix(round);
        console.log("time", Number(time));
        let getRoundEndTime = moment
          .unix(Number(time.toString()))
          .utc()
          .format("YYYY-MM-Do HH:mm:ss UTC");
        let getRoundStartTime = moment
          .unix(Number(startTime.toString()))
          .utc()
          .format("YYYY-MM-Do HH:mm:ss UTC");
        // .format("YYYY-MM-Do h:mm:ss a");

        //  let remainTokens = await NFTCrowdsaleContract.round_purchase(round)

        //  let getRoundlimit = await NFTCrowdsaleContract.getRoundlimit(round);

        let getRoundlimit_ = [];
        let remainTokens_ = [];
        for (let index = 1; index < 4; index++) {
          let tempRoundlimit = await NFTCrowdsaleContract.getRoundlimit(index);
          let tempRemainTokens = await NFTCrowdsaleContract.round_purchase(
            index
          );
          remainTokens_.push(
            Math.floor(
              Number(ethers.utils.formatEther(tempRoundlimit)) -
                Number(ethers.utils.formatEther(tempRemainTokens))
            )
          );
          getRoundlimit_.push(
            Math.floor(Number(ethers.utils.formatEther(tempRoundlimit)))
          );
        }

        //

        let value = ethers.utils.formatEther(_price);
        let _qty = Math.ceil(
          Number(ethers.utils.formatEther(_min)) / Number(value)
        );
        let currentTime = new Date().getTime();

        let obj = {
          round,
          _price: ethers.utils.formatEther(_price),
          _min: Number(ethers.utils.formatEther(_min)),
          _max: Number(ethers.utils.formatEther(_max)),
          value: Number(value) * _qty,
          _qty,
          _timeInNumber: Number(time),
          getRoundEndTime,
          remainTokens: remainTokens_,
          getRoundlimit: getRoundlimit_,
          //  WhitelistCheck : _payees ? true : false,
          WhitelistCheck: _payees,
          _account,
          getRoundStartTime,
          compareTime : currentTime / 1000 > Number(time),
        };
        setData(obj);
      } catch (error) {
        console.log("data", error);
      }
    } catch (e) {
      console.log("data", e);
    }
  };

  const getRoundPrice2 = async () => {

   
    try {
      let provider = window.ethereum;
      const web3 = new Web3(provider);
      let NFTCrowdsaleContract = new web3.eth.Contract(CrowdsaleABI2.abi, crowdsale_addr);
      let _account = "0x0000000000000000000000000000000000000000";
      
   
      let _payees = await NFTCrowdsaleContract.methods._payees(_account).call();
      console.log("_payees with non", _payees);

   

      setWhitelist(
          _payees
              ? "You are whitelisted!"
              : "Not eligible - check Twitter or Telegram to get whitelisted."
      );

      try {
        let round;
        try {
          round = (await NFTCrowdsaleContract.methods._currentRound().call()).toString();
        } catch (error) {
          round = "0";
        }
        let _price = await NFTCrowdsaleContract.methods.getRoundPrice(round).call();
        let _min = await NFTCrowdsaleContract.methods.minBuy().call();
        let _max = await NFTCrowdsaleContract.methods.maxBuy().call();
        let time = await NFTCrowdsaleContract.methods.getRoundEndTime(round).call();
        let startTime = await NFTCrowdsaleContract.methods.round_startingUnix(round).call();
        console.log("time", Number(time));
        let getRoundEndTime = moment
            .unix(Number(time.toString()))
            .utc()
            .format("YYYY-MM-Do HH:mm:ss UTC");
        let getRoundStartTime = moment
            .unix(Number(startTime.toString()))
            .utc()
            .format("YYYY-MM-Do HH:mm:ss UTC");
        // .format("YYYY-MM-Do h:mm:ss a");

        //  let remainTokens = await NFTCrowdsaleContract.round_purchase(round)

        //  let getRoundlimit = await NFTCrowdsaleContract.getRoundlimit(round);

        let getRoundlimit_ = [];
        let remainTokens_ = [];
        for (let index = 1; index < 4; index++) {
          let tempRoundlimit = await NFTCrowdsaleContract.methods.getRoundlimit(index).call();
          let tempRemainTokens = await NFTCrowdsaleContract.methods.round_purchase(
              index
          ).call();
          remainTokens_.push(
              Math.floor(
                  Number(ethers.utils.formatEther(tempRoundlimit)) -
                  Number(ethers.utils.formatEther(tempRemainTokens))
              )
          );
          getRoundlimit_.push(
              Math.floor(Number(ethers.utils.formatEther(tempRoundlimit)))
          );
        }

        //

        let value = ethers.utils.formatEther(_price);
        let _qty = Math.ceil(
          Number(ethers.utils.formatEther(_min)) / Number(value)
        );
        let currentTime = new Date().getTime();

        let obj = {
          round,
          _price: ethers.utils.formatEther(_price),
          _min: Number(ethers.utils.formatEther(_min)),
          _max: Number(ethers.utils.formatEther(_max)),
          value: Number(value) * _qty,
          _qty,
          _timeInNumber: Number(time),
          getRoundEndTime,
          remainTokens: remainTokens_,
          getRoundlimit: getRoundlimit_,
          //  WhitelistCheck : _payees ? true : false,
          WhitelistCheck: _payees,
          _account,
          getRoundStartTime,
          compareTime : currentTime / 1000 > Number(time),
        };
        setData(obj);
      } catch (error) {
        console.log("data", error);
      }
  

    } catch (e) {
      console.log("data", e);
    }
 
  
};

  const notEligible = data?.round == "3";
  console.log(notEligible);
  useEffect(() => {
    (async () => {
      try {
      if(account) {
        await getText()
        await getRoundPrice(await loadProvider());
      }
      else {
       await getRoundPrice2();
      }
        
      } catch (error) {
        console.log(error);
      }
    })();
  }, [account]);

  // useEffect(() => {
  //   (async () => {
  //     if (library) {
  //       setLib(async () => {
  //         await getRoundPrice(library);
  //         return library;
  //       });
  //     }
  //   })();
  // }, [library]);

  // useEffect(() => {
  //   getRoundPrice(lib);
  // }, [lib]);

  return (
    <>
      <Header />
      <div className="main-wrapper">
        {/* ========================Home-Banner===================  */}
        <section id="banner">
          <div className="custom-container">
            <div className="sec-padding">
              <Row>
                <Col lg={12}>
                  <div className="main mt-5">
                    <div className="img d-flex justify-content-center">
                      <img src={BannerLogo} alt="Banner-img.png" />
                    </div>
                    <div className="content text-center">
                      <h3 className="my-4">The People’s Digital Marketplace</h3>
                      <div className="buttons">
                        <a
                          href={BannerLogo}
                          target="_blank"
                          className="btn primary-btn my-3"
                        >
                          Read Whitepaper
                        </a>
                      </div>
                      <div className="long-bar">
                        <div className="grey my-1">
                          <button className="btn primary-btn">
                            {data?.round !== undefined ?
                              Number(data?.round) >= 3 && data?.compareTime == false?
                              `Round 3 of ICO started at ${data?.getRoundStartTime}.`
                          :
                          Number(data?.round) >= 3 && data?.compareTime == true ?
                          `Crowdsale complete - see Twitter and Telegram for updates.`
                          :
                               `Round ${data?.round} of ICO started at ${data?.getRoundStartTime}. Connect wallet
                          to check eligibility.`
                              : `Round 1 of ICO will start on ${text}. Connect wallet
                          to check eligibility.`}
                          </button>
                        </div>

                        {/* <div className="my-2">
                        <button className="primary-btn">
                          {whitelist}
                        </button>
                      </div> */}
                        <div
                          className={`black my-2 ${
                            Number(data?.round) >= 3 ? "d-none" : "d-block"
                          }`}
                        >
                          <button
                            className={
                              "btn " +
                              (whitelist == "You are whitelisted!"
                                ? "primary-btn"
                                : "secondry-btn")
                            }
                          >
                            {whitelist}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </section>
        {/* ============================Home-Boxes===================== */}
        <section id="boxes">
          <div className="custom-container">
            <div className="sec-padding">
              <Row className="gy-5">
                <ICOContainer
                  round={"1"}
                  loadProvider={loadProvider()}
                  data={data}
                  library={null}
                  // getRoundEndTime={getRoundEndTime}
                />
                <ICOContainer
                  round={"2"}
                  loadProvider={loadProvider()}
                  data={data}
                  library={null}
                  // getRoundEndTime={getRoundEndTime}
                />
                <ICOContainer
                  round={"3"}
                  loadProvider={loadProvider()}
                  data={data}
                  library={null}
                  // getRoundEndTime={getRoundEndTime}
                />
              </Row>
            </div>
          </div>
        </section>
        {/* ==============================Mailing-list====================== */}
        <section id="mailing-list">
          <div className="sec-padding">
            <div className="container">
              <Row>
                <Col>
                  <div className="main-mailing-list">
                    <div className="send-portfolio text-center">
                      <div className="secondry-btn w-100">
                        Interested artists please send your portfolio and social
                        media accounts to
                        <a href="mailto:artists@trapdart.com?subject=Artist application">
                          {" "}
                          artists@trapdArt.com
                        </a>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <MailingList />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default Home;

function ICOContainer({ round, loadProvider, data, library }) {
  // ================zubair===========
  var roundEndTime =
    data?._timeInNumber !== undefined ? data?._timeInNumber : 0; //1664280517678
  console.log("roundEndTime", roundEndTime);
  let currentTime = new Date().getTime();
  console.log("currentTime", currentTime);
  const compareTime = currentTime / 1000 > roundEndTime;
  const dataround = data?.round !== undefined ? data?.round : 0;
  console.log("^round", round);
  console.log("^data?.round", dataround);
  console.log("^compare round", Number(dataround) < Number(round));
  console.log("^compare Time", compareTime);

  const _class =
    round === data?.round && !compareTime
      ? `Round ${round} of ICO ends ${data?.getRoundEndTime} or when sold out.`
      : Number(dataround) < Number(round) //&& compareTime
      ? `Round ${round} Upcoming`
      : `Round ${round} Complete.`;
  const _classcss =
    Number(data?.round?.toString()) >= Number(round)
      ? "main mt-5 "
      : "main mt-5"; //main blur-div  !compareTime

  let _divcondition = "d-block";
  // round === data?.round ? `d-block` : compareTime ? `d-block` : `d-none`;
  if (round === data?.round && compareTime == false) {
    _divcondition = "d-block";
  } else if (compareTime == true) {
    _divcondition = "d-none";
  } else {
    _divcondition = "d-none";
  }
  //main blur-div
  // const _class = round === data?.round ? "main mt-5 ":"main "
  const title = round === data?.round ? `tokens remaining:` : `tokens sold`;
  const _condition = round === data?.round ? false : true;
  const nominator =
    data?.remainTokens?.length > 0 && data?.getRoundlimit?.length > 0
      ? data.getRoundlimit[Number(round) - 1] -
        data.remainTokens[Number(round) - 1]
      : 0;
  console.log("nominator", nominator);
  // console.log("data.getRoundlimit[Number(round)-1]",data.getRoundlimit[Number(round)-1])
  // console.log("data.remainTokens[Number(round)-1]",data.remainTokens[Number(round)-1])
  const percentage =
    nominator > 0
      ? (nominator / data.getRoundlimit[Number(round) - 1]) * 100
      : 0;

  console.log("percentage", percentage);

  console.log("data", data);
  console.log("round", round);

  const [ETHvalue, setETHvalue] = useState(0);
  const [Trapvalue, setTrapvalue] = useState(0);
  const [_err, setErr] = useState(null);
  const [buttonTxt, setButtonTxt] = useState("Buy TRAP Tokens");

  const buyTokens = async () => {
    try {
      if (data?._account !== "0x0000000000000000000000000000000000000000") {
        console.log();
        if (data?.WhitelistCheck || round === "3") {
          let signer = await loadProvider;
          let NFTCrowdsaleContract = new ethers.Contract(
            crowdsale_addr,
            CrowdsaleABI,
            signer
          );
          setErr(null);
          setButtonTxt("Processing ...");
          if (ETHvalue.toString() != "0" && ETHvalue.toString() != "0.0") {
            let value_ = ethers.utils.parseEther(ETHvalue.toString());
            let buy = await NFTCrowdsaleContract.buyTokens({ value: value_ });
            await buy.wait();
            setButtonTxt("Buy TRAP Tokens");
          } else {
            setErr("value cannot be zero");
            setButtonTxt("Buy TRAP Tokens");
          }
        } else {
          alert("YOU ARE NOT WHITELISTED :(");
          setButtonTxt("Buy TRAP Tokens");
        }
      } else {
        alert("Please connect your wallet!");
        setButtonTxt("Buy TRAP Tokens");
      }
    } catch (e) {
      setButtonTxt("Buy TRAP Tokens");
      console.log("data", e);
      if (e.error.data.message != null) {
        setErr(e.error.data.message);
      } else {
        setErr(e.error.message);
      }
      console.log("data", e.error.message);
    }
  };

  const handleETHvalue = async (e) => {
    try {
      setETHvalue(e.target.value);
      setTrapvalue(e.target.value / data?._price);
    } catch (error) {}
  };

  const handleTRAPvalue = async (e) => {
    try {
      setTrapvalue(e.target.value);
      setETHvalue(e.target.value * data?._price);
    } catch (error) {}
  };

  const submitHandler = (e) => {
    e.preventDefault();
    buyTokens();
  };

  console.log(":::::::::::::::: ", Number(round) - 1);

  console.log(
    data?.remainTokens?.length > 0 ? data?.remainTokens[Number(round) - 1] : 0
  );
  console.log(
    data?.getRoundlimit?.length > 0 ? data?.getRoundlimit[Number(round) - 1] : 0
  );

  return (
    <Col lg={12}>
      <div className={_classcss}>
        <div className="box">
          <p>{_class}</p>

          <div className={_divcondition}>
            <p>1000 TRAP = {1000 * data?._price} ETH</p>
            {/* Number(round)+1 */}
            <p>Max buy per wallet = {data?._max} ETH</p>
            <p>
              Round {round} {title}{" "}
              {data?.remainTokens?.length > 0
                ? data.remainTokens[Number(round) - 1]
                : 0}
              /
              {data?.getRoundlimit?.length > 0
                ? data.getRoundlimit[Number(round) - 1]
                : 0}
            </p>

            <div className="bar-1 w-100  h-3 my-2">
              <div className="inner" style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="form my-3">
              <form onSubmit={submitHandler}>
                <div className="inputs">
                  <label
                    name="trap_tokens"
                    htmlFor="trap_tokens"
                    className="mx-lg-3"
                  >
                    TRAP Tokens :
                    <input
                      type="text"
                      id="trap_tokens"
                      className="trap-token"
                      value={Trapvalue}
                      onChange={(e) => handleTRAPvalue(e)}
                      required
                    />
                  </label>
                  <label name="cost_eths" htmlFor="cost_eths" className="ml-2 ">
                    Cost in ETH :
                    <input
                      type="text"
                      id="cost_eths"
                      value={ETHvalue}
                      onChange={(e) => handleETHvalue(e)}
                      required
                    />
                  </label>
                </div>
                <div className="button my-3">
                  <button
                    disabled={_condition}
                    type="submit"
                    className="btn primary-btn"
                  >
                    {buttonTxt}
                  </button>
                  {_err ? <p style={{ color: "red" }}>{_err}</p> : null}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Col>
  );
}
