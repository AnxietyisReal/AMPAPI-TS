interface Data {SESSIONID:string}
import axios from 'axios';
export default function(baseURL:string){
  const self = this;
  this.baseURL = baseURL;
  this.sessionId = '';
  this.dataSource = '';
  this.API = {
    Core: {
      GetAPISpec: []
    }
  };

  this.initAsync = async function(stage2:boolean){
    this.dataSource = (baseURL.endsWith('/') ? baseURL.substring(0,baseURL.lastIndexOf('/')) : baseURL)+'/API';
    
    for(const module of Object.keys(this.API)){
      const methods = this.API[module];
      this[module] = {};

      for(const method of Object.keys(methods)){
        this[module][method+'Async'] = function(params){
          const args = Array.prototype.slice.call(arguments,0);
          return self.APICall(module,method,args);
        }
      }

      if (stage2) return true;
      else {
        const result = await this.Core.GetAPISpecAsync();
        if (result != null){
          this.API = result;
          return await this.initAsync(true);
        } else return false;
      }
    }
  }

  this.APICall = function(module:string,methodName:string,args:string){
    const data = {} as Data;
    
    const methodParams = this.API[module][methodName].Parameters;
    const methodParamsLength = methodParams != null ? methodParams.length : 0;

    for(var a = 0; a < methodParamsLength; a++){
      const argName = methodParams[a].Name;
      const val = args[a];
      data[argName] = val;
    }

    const URI = `${this.dataSource}/${module}/${methodName}`;
    data.SESSIONID = this.sessionId;

    return new Promise(function(resolve,reject){
      axios.post(URI,{
        body: JSON.stringify(data)
      },{
        headers:{'Accept':'application/vnd.cubecoders-ampapi','User-Agent':`AMPAPI-NodeJS/Axios ${axios.VERSION}`}
      }).then(()=>function(error:any,res:any,body:any){
        if (error) reject(error);
        else if (!error){
          const result = JSON.parse(body);
          if (result != null && Object.keys(result).length === 1 && result.result !== undefined) resolve(result.result);
          else resolve(result)
        }
      })
    })
  }
}