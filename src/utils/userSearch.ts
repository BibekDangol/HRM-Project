import { Alert } from "react-native";
import { supabase } from "@/supabase/supabaseClient";

export type UserSearchResult ={
  id:string,
  first_name: string | null;
  last_name:string |null;
  email:string| null ;
}
export async function searchUsers(query: string): Promise<UserSearchResult[]>{
  const q= query.trim().replace(/\s+/g, "  ");
  //trim-> removes space at start and end of string " satya bhattarai ", \s-> empty     space     between words  or tab bwteen words
  //  ,+ one or more in a row-> all empty spaces are together,  g means global -> look at whole line dont stop at first gap, replace all those gaps with single "".
if (!q|| q.trim() === "" ) return[];
//if query nai chaina vane return empty array
try{
  const {data, error} = await supabase.from('profiles')
  .select("id, first_name, last_name, email").or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
  .limit(10);
  if(error){
    Alert.alert("Error Searching User", error.message)
    return [];
  }
  return data;
} catch(err){
  console.log("Unexpecetd error searching user", err);
  return [];
}
}