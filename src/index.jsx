// 1: The entry point of the application 
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./styles/index.css";
import { ApolloClient, InMemoryCache, ApolloProvider} from "@apollo/client";

const client = new ApolloClient(
    {
        uri: 'http://localhost:8080/graphql', // the GraphQL endpoint
        cache: new InMemoryCache()
    }
)
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>

);
