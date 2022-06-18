import { ChakraProvider } from "@chakra-ui/react";
import { createClient, Provider, useMutation } from "urql";
import theme from "../theme";
import { AppProps } from "next/app";

// urql client
const client = createClient({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include", // this will send a cookie, we need this for getting the cookie when we register/login
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
