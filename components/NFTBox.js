import { useState, useEffect } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import nftMarketplaceABI from "../constants/NFTMarketplace.json";
import basicNFTABI from "../constants/BasicNFT.json";
import Image from "next/image";
import { Button, Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncateString = (fullStr, strLen) => {
	if (fullStr.length <= strLen) {
		return fullStr;
	}
	const seperator = "...";
	const seperatorLength = seperator.length;
	const numberOfCharToShow = strLen - seperatorLength;
	const frontChar = Math.ceil(numberOfCharToShow / 2);
	const endChar = Math.floor(numberOfCharToShow / 2);

	return `${fullStr.substring(0, frontChar)}${seperator}${fullStr.substring(
		fullStr.length - endChar
	)}`;
};

export default function NFTBox({
	price,
	nftAddress,
	tokenId,
	marketPlaceAddress,
	seller,
}) {
	const dispatch = useNotification();
	const { isWeb3Enabled, account } = useMoralis();
	const [imageURI, setImageURI] = useState("");
	const [tokenName, setTokenName] = useState("");
	const [tokenDescription, setTokenDescription] = useState("");
	const [showModal, setShowModal] = useState(false);

	// console.log(nftAddress);

	const { runContractFunction: getTokenURIForImg } = useWeb3Contract({
		abi: basicNFTABI,
		contractAddress: nftAddress,
		functionName: "tokenURI",
		params: {
			tokenId: tokenId,
		},
	});

	const { runContractFunction: buyTheNFT } = useWeb3Contract({
		abi: nftMarketplaceABI,
		contractAddress: marketPlaceAddress,
		functionName: "buyItem",
		msgValue: price,
		params: {
			nftAddress,
			tokenId,
		},
	});


	const { runContractFunction: cancelNFTListing } = useWeb3Contract({
		abi: nftMarketplaceABI,
		contractAddress: marketPlaceAddress,
		functionName: "cancelListing",
		onSuccess:handleCancelNFTSuccess,
		params: {
			nftAddress,
			tokenId
		}
	})

	const isOwnedByUser = seller === account || seller === undefined;
	const formattedSeller = isOwnedByUser ? "you" : seller;
	const truncatedSeller = truncateString(formattedSeller, 15);

	async function updateUI() {
		try {
			const tokenURI = await getTokenURIForImg();
			console.log(`The token URI is ${JSON.stringify(tokenURI)}`);
			if (tokenURI) {
				const requestURL = tokenURI.replace(
					"ipfs://",
					"https://ipfs.io/ipfs/"
				);
				console.log(`The request URI is ${requestURL}`);
				const tokenURIResponse = (await (await fetch(requestURL)).json());
				const imageURL = tokenURIResponse.image;
				console.log(`The image URI is ${imageURI}`);
				const imageURIURL = imageURL.replace(
					"ipfs://",
					"https://ipfs.io/ipfs/"
				);
				setImageURI(imageURIURL);
				setTokenName(tokenURIResponse.name);
				setTokenDescription(tokenURIResponse.description);
			}
		} catch (error) {
			setImageURI("")
			console.log(error);
			console.log("There was some error");
		}
	}

	async function handleUpdateButton() {
		 setShowModal(true)	
	}

	async function handleBuyButton() {
		console.log("btn Clicked");
		await buyTheNFT({
			onError: (error) => {
				console.log(error);
			},
			onSuccess: handleBuyItemSuccess,
	  });
	}

	async function handleCancelListing() {
		await cancelNFTListing()
	}

	async function handleCancelNFTSuccess(transectionResponse) {
		await transectionResponse.wait(1)
		dispatch({
			type: "success",
			message: "Listing Cancelled",
			title: "Listing Cancelled Successfully",
			position: "topR",
		});
	}

	function handleBuyItemSuccess() {
		dispatch({
			type: "success",
			message: "Item Bought",
			title: "Item Bought",
			position: "topR",
		});
	}

	function hideModal() {
		setShowModal(false);
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			console.log("Web 3 enabled");
			updateUI();
		}
	}, [isWeb3Enabled]);


	return (
		<div className="p-8">
			<div>
				{imageURI ? (
					<div>
						<UpdateListingModal
							marketPlaceAddress={marketPlaceAddress}
							tokenId={tokenId}
							nftAddress={nftAddress}
							isVisible={showModal}
							onClose={hideModal}
						/>
					
						<Card
							title={tokenName}
							description={tokenDescription}
							// onClick={!isOwnedByUser ? handleCardClick : undefined}
						>
							<div className="p-2">
								<div className="flex flex-col items-end gap-2">
									<div>#{tokenId}</div>
									<div className="italic text-sm">
										Owned by {truncatedSeller}
									</div>
									<div className="flex">
										<Image
											loader={() => imageURI}
											src={imageURI}
											height="200"
											width="200"
										/>
										
										<div className="font-bold">
											{ethers.utils.formatUnits(
												price,
												"ether"
											)}{" "}
											ETH
										</div>
									</div>
									{isOwnedByUser ?
										<div className="flex flex-row">
											<div className="p-3">
												<Button
													text="Cancel Listing"
													onClick={handleCancelListing}
												/>
											</div >
											<div className="p-3">
												<Button text="Update Price" onClick={handleUpdateButton}/>
											</div>
										</div>
										:
										<div className="w-full flex justify-center">
											<Button text="Buy" onClick={handleBuyButton}/>
										</div>
									}
								</div>
							</div>
						</Card>
					</div>
				) : (
					<div>Loading...</div>
				)}
			</div>
		</div>
	);
}
