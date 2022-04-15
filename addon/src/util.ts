

export interface RafayError{
    readonly details: ErrorDetails[];

    
}

export interface ErrorDetails {

    readonly error_code: string;

    readonly detail: string;


}

export function isDuplicateOrganization(data:RafayError):boolean{
    const error:ErrorDetails =  data.details[0]
      if (error.error_code === "CONFIG035"){
          return true
      }
      return false
}

export function extractError(data:RafayError): ErrorDetails{
    if (data.details){
      const error:ErrorDetails =  data.details[0]
      return error
    }else{
        return {error_code:"GEN001",detail:JSON.stringify(data)} as ErrorDetails
    }
}