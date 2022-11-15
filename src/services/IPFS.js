import axios from "axios";


export const uploadFile = async (file, onError) => {
	try {
		const formData = new FormData();
                formData.append("file", file);

                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
                        'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
                        "Content-Type": "multipart/form-data"
                    },
                });

                const ImgHash = `https://trapdart.mypinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            	console.log(ImgHash); 
				return ImgHash
		
	} catch (error) {
		console.log(error)
	}
				

	
};

export const uploadJSON = async (Data, onError) => {
	try {
		

                const resData = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                    data: JSON.stringify(Data),
                    headers: {
                        'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
                        'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
                        "Content-Type": "application/json"
                    },
                });

                const ImgURL = `https://trapdart.mypinata.cloud/ipfs/${resData.data.IpfsHash}`;
            	console.log(ImgURL); 
				return {Hash : resData.data.IpfsHash , ImgURL}
		
	} catch (error) {
		console.log(error)
	}
				

	
};