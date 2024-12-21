import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post)=>{
  try { 
    if(post.file && typeof post.file=='object'){
      let isImage = post.file.type=="image"
      let folderName= isImage ?'postImages':"postVideos";
      let fileResult = await uploadFile(folderName, post.file.uri, isImage)
      if(fileResult.success) post.file= fileResult.data
      else{
        return fileResult
      }
    
    }

    const {data, error} = await supabase
    .from('posts')
    .upsert(post)
    .select()
    .single()

    if(error){
      console.log('createPost error', error)
      return {sucess: false, msg:'Could not create your post'}
    }
    return {sucess:true, msg:'Could not create your post'}

    
  } catch (error) {
    console.log('CreatePost error: ', error)
    return {sucess: false, msg:'Could not create your post'}
  }
}