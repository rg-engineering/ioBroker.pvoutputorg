export interface iobObject {
    type: string,
    common: {
        name: string,
        role: string,
        type: string,
        unit?: string,
        read: boolean,
        write: boolean,
        desc?: string
    },
    native?: { id: string }
}



export interface PvoutputorgConfig {
    IsActive: boolean,
    Name: string,
    SystemId: string,
    ApiKey: string,
    Upload: boolean,
    CumulativeFlag: number,
    NetDataFlag:number,
    IsDonated: boolean,

    
}