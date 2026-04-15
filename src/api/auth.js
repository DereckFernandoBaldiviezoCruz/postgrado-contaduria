export const loginAPI = async(usuario,password)=>{
  return await window.api.login(usuario,password);
};