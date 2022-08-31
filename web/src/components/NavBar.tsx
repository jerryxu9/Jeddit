import { Box, Flex, Link, Button } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  // data is loading
  if (fetching) {
    body = null;
  }
  // user not logged in, display login/register links
  else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" marginRight={2}>
            login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">register</Link>
        </NextLink>
      </>
    );
  }
  // user is logged in, display welcome message
  else {
    body = (
      <Flex>
        <Box textColor={"white"} mr={8}>
          Welcome back, {data.me.username}
        </Box>
        <Button variant="link" textColor={"white"}>
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="teal" padding={4} marginLeft={"auto"}>
      <Box marginLeft={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
