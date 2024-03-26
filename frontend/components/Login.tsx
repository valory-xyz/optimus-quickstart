import { Button, Typography } from 'antd';
import { Wrapper } from './Layout/Wrapper';

export const Login = () => {
  return (
    <Wrapper>
      <Typography.Title>Login</Typography.Title>
      <input type="text" placeholder="Enter your password" />
      <Button>Login</Button>
    </Wrapper>
  );
};
