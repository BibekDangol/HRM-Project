import LoadingState from "./states/LoadingState";

type Props = {
  message?: string;
};

export default function LoadingIndicator({ message = "Loading..." }: Props) {
  return <LoadingState message={message} fullScreen />;
}
