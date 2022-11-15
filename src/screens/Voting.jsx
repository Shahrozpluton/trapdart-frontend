import React from "react";
import { Col, Row } from "react-bootstrap";
import { Header, Footer, MailingList } from "../components/index";
import apis from "../services/index";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import moment from "moment";
import Web3Modal from "web3modal";

function Voting() {
  const [proposalOBJ, setProposalOBJ] = useState([]);
  const [updateproposalOBJ, setupdateProposalOBJ] = useState(0);
  const [_err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);

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

  const createVote = async (id, option) => {
    try {
      let signature = await sig();

      let vote = await apis.createVote(id, {
        proposals_id: id,
        voter_address: account,
        selected_option: option,
        signature: signature,
      });
      setupdateProposalOBJ(updateproposalOBJ + 1);
      alert("Voted Successfully");
      console.log("VOTE", vote);
    } catch (error) {
      alert(
        error.response.data.message === undefined
          ? "You must hold TRAP tokens to vote."
          : error.response.data.message
      );
      console.log("createVote", error.response.data.message);
    }
  };
  const getProposals = async () => {
    try {
      const data = await apis.getTypeProposals("NORMAL");
      let temp = [];
      console.log("data", data);

      data.data.map((arr) => {
        //let arr =
        const arrr = [];

        arr.options &&
          Object.keys(arr.options).forEach((key) =>
            arrr.push({ name: key, value: arr.options[key] })
          );
        console.log(arrr);

        let obj = {
          description: arr.description,
          image: arr.image,
          proposal_id: arr.id,
          title: arr.title,
          options: arrr,
          total_passed: arr.total_passed,
          total_votes: arr.total_votes,
          closing_date: arr.closing_date,
          created_at: arr.created_at,
        };
        temp.push(obj);
        console.log("TIME", moment.isDuration(arr.closing_date));
        console.log("TIME", moment.utc(arr.closing_date));
        console.log("TIME", moment(arr.closing_date).unix() - moment().unix());
        console.log(
          "TIME BEFORE",
          moment().isBefore(arr.closing_date, "seconds")
        );

        console.log("DATA :", obj);
      });

      setProposalOBJ(temp.length && temp.reverse());
    } catch (error) {
      console.log("getProposals :: ListVote screen :", error);
    }
  };

  useEffect(() => {
    (async () => {
      if (true) {
        try {
          getProposals();
        } catch (error) {
          console.log("Error ", error.message);
        }
        return () => {};
      }
    })();
  }, [library, account, chainId, updateproposalOBJ]);

  return (
    <>
      <Header />
      <div className="main-wrapper">
        <section id="voting" className="custom_height">
          <div className="custom-container">
            <div className="sec-padding">
              <Row className="gy-5">
                <Col lg={12}>
                  <div className="box box-1">
                    <p>
                      TRAP token holders can participate in polls to direct the
                      development and <br /> progression of the trapdArt
                      platform. Polls are discussed amongst the community in the
                      Telegram channel -{" "}
                      <a
                        href="https://t.me/trapdArt"
                        target="_blank"
                        className="text-black"
                      >
                        {" "}
                        https://t.me/trapdArt{" "}
                      </a>
                    </p>
                  </div>
                </Col>
                {proposalOBJ.length > 0
                  ? proposalOBJ?.map((_, key) => {
                      return (
                        <Col lg={6}>
                          <div className="box">
                            <p>
                              {_.title} <br />
                              {_.description}
                              <br /> Voting closes on{" "}
                              {
                                moment(_.closing_date)
                                  .utc()
                                  .format("YYYY-MM-Do HH:mm:ss UTC")
                                // .format("YYYY-MM-Do h:mm:ss a")
                              }
                            </p>
                            <div className="box-inner-btn d-flex flex-wrap justify-content-center ">
                              {moment().isBefore(_.closing_date, "seconds") ? (
                                _?.options.map((i, k) => {
                                  return (
                                    <button
                                      className="btn primary-btn"
                                      onClick={() => {
                                        console.log(i.name.toString());
                                        createVote(
                                          _.proposal_id,
                                          i.name.toString()
                                        );
                                      }}
                                    >
                                      {i.name}
                                    </button>
                                  );
                                })
                              ) : (
                                <button className="btn secondry-btn voting-closed">
                                  Voting Closed
                                </button>
                              )}
                            </div>
                            <div className="box-inner-calc percent-flex">
                              {_?.options.map((i, k) => {
                                return (
                                  <div className="d-flex flex-column">
                                    <p>
                                      {i?.name}: {i?.value}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </Col>
                      );
                    })
                  : null}
              </Row>
            </div>
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
