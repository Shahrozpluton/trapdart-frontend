import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Telegram, Twitter } from "./images";

function Footer() {
  return (
    <>
      <footer>
        <Row className="align-items-center justify-sm-center flex-column-reverse flex-md-row">
          <Col lg={3} md={3} sm={12}>
            <div className="copy-right glow">
              <span>© trapdigital 2022</span>
            </div>
          </Col>
          <Col lg={9} md={9} sm={12}>
            <div className="wallet-btn  footer-icons">
              <a
                href="https://t.me/trapdArt"
                target="_blank"
                className="text-white mx-3 glow"
              >
                <img src={Telegram} alt="telegram.png" className="mx-2" />
                Telegram
              </a>
              <a
                href="https://twitter.com/trapdArt"
                target="_blank"
                className="text-white glow"
              >
                <img src={Twitter} alt="telegram.png" className="mx-2" />
                Twitter
              </a>
            </div>
          </Col>
        </Row>
      </footer>
    </>
  );
}

export default Footer;
