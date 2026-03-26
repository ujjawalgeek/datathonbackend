class ApiResponse {
    constructor( status, data, message ="Success"){
        this.statusCode= status;
        this.data= data;
        this.message= message;
        this.success = this.statusCode < 400
    }
}

export { ApiResponse}