import Head from "next/head";
import { useMoralisQuery, useMoralis } from "react-moralis";
import styles from "../styles/Home.module.css";
import NFTBox from "../components/NFTBox";
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/subGraphQueries";
import { useQuery } from "@apollo/client";

export default function Home() {
	const { isWeb3Enabled ,chainId} = useMoralis();
	const chainIdString = chainId ? parseInt(chainId).toString():"1337"
	const marketPlaceAddress = networkMapping[chainIdString]["NFTMarketplace"][0]

	const {loading,error,data:listedNFTs}=useQuery(GET_ACTIVE_ITEMS)

	return (
		<div className="container mx-auto">
			<Head>
				<title>NFT Marketplace</title>
				<meta
					name="description"
					content="NFT market place using moralis indexer"
				/>
			</Head>
			<h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
			<div className="flex flex-wrap">
				{isWeb3Enabled ? (
					loading || !listedNFTs ? (
						<div>Loading...</div>
					) : (
						listedNFTs.activeItems.map((nft) => {
							// console.log((nft.attributes));
							const {
								price,
								nftAddress,
								tokenId,
								// marketPlaceAddress,
								seller,
							} = nft;
							return (
								<div>
									<NFTBox
										price={price}
										nftAddress={nftAddress}
										tokenId={tokenId}
										marketPlaceAddress={marketPlaceAddress}
										seller={seller}
										key={`${nftAddress}${tokenId}`}
									/>
								</div>
							);
						})
					)
				) : (
              <h1 className="py-4 px-4 font-bold text-xl">Web 3 Not Enabled, Connect your wallet to start.</h1>
				)}
			</div>
		</div>
	);
}
