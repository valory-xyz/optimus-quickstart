import { PropsWithChildren } from "react";

export const Layout = ({ children }: PropsWithChildren) => {
    return <>
        <nav></nav>
        {children}
    </>
};