import axios from "axios";
import React, { useState } from "react";
import { Container } from "react-bootstrap";
function MailingList() {
  const [email,setEmail] = useState('');
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [isclick,setIsclick] = useState(false);
  const Subscribe = async (e) => {
      e.preventDefault();
      setIsclick(true);
      await axios.post(process.env.REACT_APP_SUBSCRIPTION_API_URL+'subscribe', {
          email:email,
      },{headers:{
          "Accept" : "application/json"
      }})
      .then(function (res) {
          setSuccess(res.data.message);
          // setTimeout(() => {
          // setSuccess('');
          // }, 3000);
          setIsclick(false);
      })
      .catch(function (error) {
          setError(JSON.parse(error.request.response))
          setTimeout(() => {
            setError('');
            }, 3000);
          setIsclick(false);
      });
  }
  return (
    <div className="container">
        <div className="main-mailing-list">
          <div className="row ">
            <div className="col-12">
              <div className="form my-1">
                <form onSubmit={(e) => Subscribe(e)} className="subscribe-form">
                  <div className="custom-input-box">
                    <label name="trap_tokens" htmlFor="trap_tokens">
                      Join our mailing list for the latest news
                    </label>
                    <div className="input-box">
                    <input
                        type="email"
                        id="trap_tokens"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                      />
                    
                    </div>
                    <button className="primary-btn disable-hover">Sign me up!</button>
                  </div>
                    
                </form>
              </div>

           
            {
              success ? 
              <div className="col-12">
              <div className="form my-1">
                <div className="inputs px-5 py-1 text-center">
                  <p >
                    Thank you for signing up to the mailing list. You will
                    receive latest news and and announcements via email.
                  </p>
                </div>
              </div>
            </div> :
            error && 
            <div className="col-12">
            <div className="form my-1">
              <div className="inputs px-5 py-1 text-center">
                <p className="text-danger">
                {error.email}
                </p>
              </div>
            </div>
          </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default MailingList;
