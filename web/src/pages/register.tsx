import React from "react";
import { Formik, Form } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
} from "@chakra-ui/react";

interface registerProps {}

const register: React.FC<registerProps> = ({}) => {
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ values, handleChange }) => (
        <Form>
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input
              value={values.username}
              onChange={handleChange}
              id="username"
              placeholder="username"
            />
            {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}
          </FormControl>
          <Button mt={4} colorScheme="teal" type="submit">
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default register;
