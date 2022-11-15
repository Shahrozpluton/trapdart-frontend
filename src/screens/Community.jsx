import React, { useCallback } from "react";
import { Container, Col, Row } from "react-bootstrap";
import { Header, Footer, MailingList } from "../components/index";

import apis from "../services";
import { uploadJSON } from "../services/IPFS";

import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import moment from "moment";
import Web3Modal from "web3modal";

import { nFT_addr } from "../contract/addresses";
import NFTABI from "../contract/NFT.json";

import {
  Shape1,
  Shape2,
  Shape3,
  Shape4,
  Shape5,
  Shape6,
  Shape7,
  Shape8,
  Shape9,
  Shape10,
} from "../components/images";
import { Description } from "@ethersproject/properties";

function Voting() {
  const [updateproposalOBJ, setupdateProposalOBJ] = useState(0);
  const [title, setTitle] = useState("Voting Open until");
  const [strokes, setStrokes] = useState([
    // {
    //   id: 0,
    //   proposals: [],
    // },{
    //   id: 1,
    //   proposals: [],
    // },{
    //   id: 2,
    //   proposals: [],
    // },
  ]);
  const [_proposals, setProposals] = useState([]);

  const {
    connector,
    library,
    account,
    chainId,
    activate,
    deactivate,
    active,
    error,
  } = useWeb3React();

  const [image, setImage] = useState(null);
 
  const mintNFT = async () => {
    try {
      if (image && image != null) {
        let signer = await loadProvider();
        let NFTContract = new ethers.Contract(nFT_addr, NFTABI, signer);
        let metaData = {
          name: 'trapdArt Community Created Art #1',
          description: 'trapdArt Community Created Art #1',
          image: image,
        };

        let { Hash } = await uploadJSON(metaData);
        let mint = await NFTContract.createToken(account, Hash);

        await mint.wait();

        alert("NFT MINTED");
      } else {
        alert("Minting Not started");
      }
    } catch (e) {
      console.log(e.code)
      if(e.code == 4001 || e.code == -32603 || e.code == 'UNPREDICTABLE_GAS_LIMIT'){
        alert(
          'Transaction denied.'
        );
      }else{ alert(
        'Only ICO participants can vote.'
      );}
     
      // const message = e.error?.data?.message.split("\'").at(-2)
      // console.log("MESSAGE", message);
    }
  };

  const loadProvider = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      return provider.getSigner();
    } catch (e) {
      console.log("loadProvider default: ", e);
    }
  };

  const sig = async () => {
    let signer = await loadProvider();
    let message = "Casting a vote";
    let s = await signer.signMessage(message);
    return s;
  };

  const createVote = async (id, option, strokeId = 0) => {
    try {
      console.log(id);
      let signature = await sig();

      let vote = await apis.createVote(id, {
        proposals_id: id,
        voter_address: account,
        selected_option: option,
        signature: signature,
        strokeId,
      });
      setupdateProposalOBJ(updateproposalOBJ + 1);
      alert("Successfully voted");
    } catch (error) {
      alert(
        error.response.data.message === undefined
          ? "You must hold TRAP tokens to vote."
          : error.response.data.message
      );

      console.log("createVote", createVote);
    }
  };

  const getProposalByID = async (id) => {
    const response = await apis.getSingleProposal(id);
    return response.data;
  };

  const getAllStrokes = useCallback(async () => {
    try {
      const { data: strokes } = await apis.getAllStrokes();
      const totaldata = [];

      let _d = [];

      strokes.forEach(async (stroke) => {
        const proposals = [];

        totaldata.push({ id: stroke.id, proposal_ids: stroke.proposal_ids });
      });
      console.log(totaldata, "###############");
      //decide the wich array to fetch according to time
      for (let index = 0; index < totaldata.length; index++) {
        let _p = [];
        for (let j = 0; j < totaldata[index].proposal_ids?.length; j++) {
          let id = totaldata[index]?.proposal_ids[j];
          const proposal = await getProposalByID(id);
          _p.push(proposal);
        }
        _d.push(_p);
      }

      let Times = [];
      let finalData = [];
      console.log("asddd", _d);
      for (let index = 0; index < _d.length; index++) {
        let endTime = moment(_d[index][0]?.closing_date).unix();
        let currentTime = Date.now() / 1000;

        if (endTime > currentTime) {
          let now = moment(_d[index][0].created_at); //todays date
          let end = moment(_d[index][0].closing_date); // another date
          let duration = moment.duration(end.diff(now));

          let days = duration.asDays();

          let sets = totaldata[index].proposal_ids.length / 3;

          let one_day =
            duration._milliseconds / 1000 / sets < 0
              ? (duration._milliseconds / 1000 / sets) * -1
              : duration._milliseconds / 1000 / sets;

          let temp_day = 0;

          let time = moment(_d[index][0].created_at).unix();

          console.log("currentTime", currentTime);
          console.log("TIME", time + one_day);
          console.log("one day ", one_day);

          while (currentTime > time + one_day) {
            console.log("in");
            time += one_day;
            temp_day++;
          }

          const sliceer =
            parseInt(temp_day % 3) * 3 + temp_day > 2 ? 3 * temp_day : 0;

          Times.push(
            moment.unix(_d[index][0].closing_date).from(_d[index][0].created_at)
          );
          finalData.push(_d[index].reverse().slice(sliceer, sliceer + 3));
        } else {
          console.log(totaldata[index].id);
          let { data } = await apis.getWinnerProposal(totaldata[index].id);
          console.log("WINNNNNERRRR", data);
          if (data !== "empty stokes") {
            data.final = true;
            let max_index = 0;

            console.log(
              Number(data[0]?.total_votes),
              Number(data[1]?.total_votes),
              Number(data[2]?.total_votes)
            );

            const max = Math.max(
              Number(data[0]?.total_votes),
              Number(data[1]?.total_votes),
              Number(data[2]?.total_votes)
            );

            console.log("mAAAAAAAAAAAAAAAXXXXXXXXXXXX", max);

            for (let i = 0; i < data.length - 1; i++) {
              if (Number(data[i]?.total_votes) == max) {
                max_index = i;
              }
            }
            console.log("MAX_INDEX", max_index);
            console.log("DATA>MAX", data);
            data[max_index].winner = true;

            _d[index] = data;
            finalData.push(_d[index]);
          } else {
            finalData.push({
              id: 1,
              proposals: [],
            });
          }
        }
      }
      console.log("FINAL--DATA", finalData);

      setProposals(finalData.reverse());
      setStrokes(totaldata.reverse());
    } catch (error) {
      console.log("getAllStrokes", error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (true) {
        try {
          const response = await apis.getPicture();
          console.log("IMAGES", response);
          setImage(response.data.image_url);
          getAllStrokes();
        } catch (error) {
          console.log("Error ", error.message);
        }
      }
    })();
  }, [account, chainId, updateproposalOBJ]);

  return (
    <>
      <Header />
      <div className="main-wrapper">
        <section id="community" className="custom_height">
          <div className="sec-padding">
            <div className="custom-container">
              <Row className="gy-5">
                <Col lg={12}>
                  <div className="box box-1">
                    <p>
                      All participants of the ICO are invited to participate in
                      trapdArt’s first of a collection of community created art.
                    </p>
                    <p className="mt-3">
                      ICO participants will be able to mint the finished piece.
                    </p>
                  </div>
                </Col>
                {!image ? (
                  <></>
                ) : (
                  <Col lg={12}>
                    <div className="box">
                      <p>
                        trapdArt Community Created Art #1 <br /> Minting
                        available to all ICO participants
                      </p>
                      <div className="inner-box first-box winner d-flex justify-content-center align-items-end">
                        <div className="inner-box-img w-100 h-100">
                          <img className="w-100 h-100" src={image} />
                        </div>
                      </div>
                      <button
                        className="btn primary-btn mb-5"
                        onClick={mintNFT}
                      >
                        Mint
                      </button>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
            <Container>
              <Row className="my-5 gy-5">
                {strokes.map((value, key) => {
                  console.log("*****************", strokes);
                  return (
                    <Col lg={12}>
                      <div className="box">
                        <p>
                          trapdArt Community Created Art #1 - Stroke{" "}
                          {strokes.length - key} <br />
                          {_proposals[key]?.final === undefined
                            ? "Voting Open until"
                            : "Voting closed on"}{" "}
                          {_proposals[key] != undefined
                            ? moment(_proposals[key][0]?.closing_date)
                                .utc()
                                .format("YYYY-MM-Do HH:mm:ss UTC")
                            : null}
                          <br />{" "}
                          {_proposals[key] != undefined
                            ? _proposals[key][0]?.title
                            : null}
                          <br />{" "}
                          {_proposals[key] != undefined
                            ? _proposals[key][0]?.description
                            : null}
                        </p>
                        <Row>
                          {/* {console.log(
                          "value.proposals",
                          key,
                          value.proposals.length
                        )} */}
                          {_proposals[key]?.length > 0 &&
                            _proposals[key]?.map((detail, i) => {
                              console.log(
                                "_proposals[key]",
                                _proposals[key][0].closing_date
                              );
                              return (
                                <Col lg={4}>
                                  <div className="inner-box w-80 d-flex justify-content-center align-items-center">
                                    <div className="inner-box-img h-100">
                                      {detail.image != null ? (
                                        <img
                                          src={detail.image}
                                          alt="image.png"
                                          className="w-100 h-100"
                                        />
                                      ) : (
                                        <img
                                          src={Shape2}
                                          alt="image.png"
                                          className="w-25"
                                        />
                                      )}
                                    </div>
                                  </div>
                                  {
                                    //console.log("FINAL",)
                                    _proposals[key]?.final != true ? (
                                      <button
                                        className="btn primary-btn mb-3"
                                        onClick={() => {
                                          console.log(detail);
                                          createVote(
                                            detail.id,
                                            "yes",
                                            value.id
                                          );
                                        }}
                                      >
                                        Vote
                                      </button>
                                    ) : _proposals[key][i]?.winner ? (
                                      <button className="btn secondry-btn mb-3 w-50">
                                        {" "}
                                        Winner!
                                      </button>
                                    ) : null
                                  }
                                  <p className="mb-3">
                                    Votes: {detail.total_votes}
                                  </p>
                                </Col>
                              );
                            })}
                        </Row>
                      </div>
                    </Col>
                  );
                })}

                {/* <Col lg={12}>
                <div className="box">
                  <p>
                    trapdArt Community Created Art #1 - Stroke 2<br /> Voting
                    Closed
                  </p>
                  <Row>
                    <Col lg={4}>
                      <div className="inner-box w-80 d-flex justify-content-center align-items-center">
                        <div className="inner-box-img ">
                          <img src={Shape5} alt="image.png" className="w-25" />
                        </div>
                      </div>
                      <button className="btn primary-btn mb-3 invisible ">
                        Vote
                      </button>
                      <p className="mb-3">Votes: 6</p>
                    </Col>
                    <Col lg={4}>
                      <div className="inner-box w-80 d-flex justify-content-center align-items-center">
                        <div className="inner-box-img ">
                          <img src={Shape6} alt="image.png" className="w-25" />
                        </div>
                      </div>
                      <button className="btn primary-btn mb-3 invisible">
                        {" "}
                        Vote
                      </button>
                      <p className="mb-3">Votes: 12</p>
                    </Col>
                    <Col lg={4}>
                      <div className="inner-box winner d-flex justify-content-center align-items-center w-80">
                        <div className="inner-box-img ">
                          <img src={Shape7} alt="image.png" className="w-25" />
                        </div>
                      </div>
                      <button className="btn secondry-btn mb-3 w-50">;
                        {" "}
                        Winner!
                      </button>
                      <p className="mb-3">Votes: 82</p>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col lg={12}>
                <div className="box">
                  <p>
                    trapdArt Community Created Art #1 - Stroke 1<br /> Voting
                    Closed
                  </p>
                  <Row>
                    <Col lg={4}>
                      <div className="inner-box w-80 d-flex justify-content-center align-items-center">
                        <div className="inner-box-img ">
                          <img src={Shape8} alt="image.png" className="w-25" />
                        </div>
                      </div>
                      <button className="btn primary-btn mb-3 invisible ">
                        Vote
                      </button>
                      <p className="mb-3">Votes: 6</p>
                    </Col>
                    <Col lg={4}>
                      <div className="inner-box winner d-flex justify-content-center align-items-center w-80">
                        <div className="inner-box-img ">
                          <img src={Shape9} alt="image.png" className="w-25" />
                        </div>
                      </div>
                      <button className="btn secondry-btn mb-3 w-50">
                        {" "}
                        Winner!
                      </button>
                      <p className="mb-3">Votes: 82</p>
                    </Col>
                    <Col lg={4}>
                      <div className="inner-box w-80 d-flex justify-content-center align-items-center">
                        <div className="inner-box-img ">
                          <img src={Shape10} alt="image.png" className="w-25" />
                        </div>
                      </div>
                      <button className="btn primary-btn mb-3 invisible">
                        {" "}
                        Vote
                      </button>
                      <p className="mb-3">Votes: 12</p>
                    </Col>
                  </Row>
                </div>
              </Col> */}
              </Row>
            </Container>
          </div>
        </section>
        <div className="mt-5 mb-5">
          <MailingList />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Voting;
