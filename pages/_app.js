import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import Header from "../components/Header";
import { NotificationProvider } from "web3uikit";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
	cache: new InMemoryCache(),
	uri: "https://api.studio.thegraph.com/query/34020/for-nft-market/v0.0.1",
});

function MyApp({ Component, pageProps }) {
	return (
		<>
			<MoralisProvider initializeOnMount={false}>
				<ApolloProvider client={client}>
					<NotificationProvider>
						<Header />
						<Component {...pageProps} />
					</NotificationProvider>
				</ApolloProvider>
			</MoralisProvider>
		</>
	);
}

export default MyApp;
