export interface User{
    id:string;
    name: string;
    email:string;
    profilePictureUrl?: string;
    isVerified : boolean;
    token: string;
}