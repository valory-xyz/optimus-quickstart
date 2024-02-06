export const TimelineItem = ({ title, body }: { title: string, body: JSX.Element }) => {
    return (
        <div>
            <h1>{title}</h1>
            <div>{body}</div>
        </div>
    );
}    