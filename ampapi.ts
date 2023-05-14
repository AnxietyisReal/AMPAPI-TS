interface Data {SESSIONID:string}

class ampapi {
  sessionId = ''
  dataSource = ''
  API = { Core: { GetAPISpec: [] } }
}

class AMPAPI {
  initAsync:any
  APICall:any

  constructor(baseURL:string){
    const calls = new ampapi();
    this.initAsync = async function(stage2:boolean){
      calls.dataSource = (baseURL.endsWith('/') ? baseURL.substring(0,baseURL.lastIndexOf('/')) : baseURL)+'/API';
      for(const module of Object.keys(calls.API)){
        const methods = calls.API[module];
        this[module] = {};
        
        for(const method of Object.keys(methods)){
          this[module][method+'Async'] = function(params:string){
            const args = Array.prototype.slice.call(arguments,0);
            return this.APICall(module,method,args)
          }
        }

        if (stage2) return true;
        else {
          const result = await this.Core.GetAPISpecAsync();
          if (result != null){
            calls.API = result;
            return await this.initAsync(true)
          } else return false
        }
      }
    }

    this.APICall = async function(module:string,methodName:string,args:string){
      const data = {} as Data;
      const methodParams = this.API[module][methodName].Parameters;
      const methodParamsLength = methodParams != null ? methodParams.length : 0;

      for(var a = 0; a < methodParamsLength; a++){
        const argName = methodParams[0].Name;
        const val = args[a];
        data[argName] = val;
      }
      
      const URI = `${calls.dataSource}/${module}/${methodName}`;
      data.SESSIONID = calls.sessionId;
      try{
        const x = await fetch(URI,{
          method: 'POST',
          headers: {'Accept':'application/vnd.cubecoders-ampapi','User-Agent':'AMPAPI-NodeJS'},
          body: JSON.stringify(data)
        });
        return x.body
      }catch(err){
        throw new Error(`Failed to make a POST request to "${calls.dataSource}"`, {cause: err})
      }
    }
  }
}

export default AMPAPI