import { passcodeStrLen } from "./constants.server";

export const validateEmail = (email: string): string | undefined => {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!email.length || !validRegex.test(email)) {
        return "Please enter a valid email address";
    }
};

export const validatePassword = (password: string): string | undefined => {
    if (password.length < 5) {
        return "Please enter a password at least 5 characters long";
    }
};

export const validateName = (name: string): string | undefined => {
    if (!name.length) {
        return "Please enter a value";
    }
};

export const validatePointCode = (code: string): string | undefined => {
    if (code.length !== 36 /*16bytes + four '-'s*/ || (
        code[8] !== "-" || code[13] !== "-" ||  
        code[18] !== "-", code[23] !== "-"
    )) {
        return "Please enter a code"
    } 
};

export const validateUnsignedNumber = (value: number): string | undefined => {
    if (!Number.isInteger(value) ||
        value < 0 || value > Number.MAX_SAFE_INTEGER
    ) {
        return "Please enter a number"
    }
}

export const validateOneTimePass = (pass: string): string | undefined => {
    if (pass.length !== passcodeStrLen) {
        return "Please enter a passcode"
    }
};
