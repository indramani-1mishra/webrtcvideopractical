
import { useSearchParams } from "react-router-dom";
export default function TestUrlSearchparam() {
    const [searchParams] = useSearchParams();
    const data = Object.fromEntries(searchParams.entries());
    console.log("Received search params:", data);

    return (
        <div>
            <h1>Test URL Search Params</h1>
        </div>
    );
}