import React from "react";

const Flag = ({ flag }: { flag: string }) => {
    return(
        <button id="flag" className={flag+"-flag"} disabled>
            {flag.charAt(0).toUpperCase() + flag.slice(1)}
        </button>
    )
};

export default Flag;