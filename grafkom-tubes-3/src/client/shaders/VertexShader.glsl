attribute vec3 a_position;
attribute vec3 normal;
attribute vec4 a_color;
attribute vec2 a_uv;

attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
attribute vec3 aVertexTangent;
attribute vec3 aVertexBitangent;

uniform mat4 u_proj_matrix;
uniform mat4 u_model_matrix;
uniform mat4 u_view_matrix;
uniform mat4 u_normal_matrix;
uniform int textureEnv;

varying vec3 normalInterp;
varying vec3 vertPos;
varying lowp vec4 v_color;
varying vec2 v_uv;
varying vec3 v_world_normal;
varying vec3 v_world_position;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
attribute vec4 aVertexPosition;

varying vec3 ts_light_pos;
varying vec3 ts_view_pos;
varying vec3 ts_frag_pos;
varying highp vec2 vTextureCoord;

mat3 transpose(in mat3 inMatrix)
    {
        vec3 i0 = inMatrix[0];
        vec3 i1 = inMatrix[1];
        vec3 i2 = inMatrix[2];

        mat3 outMatrix = mat3(
            vec3(i0.x, i1.x, i2.x),
            vec3(i0.y, i1.y, i2.y),
            vec3(i0.z, i1.z, i2.z)
        );

        return outMatrix;
    }

void main() {
    vec4 vertPos4 = u_view_matrix * u_model_matrix * vec4(a_position, 1.0);
    vertPos = vec3(vertPos4) / vertPos4.w;
    normalInterp = vec3(u_normal_matrix * vec4(normalize(normal), 0.0));
    gl_Position = u_proj_matrix * vertPos4;
    v_color = a_color;
    v_uv = a_uv;

    v_world_normal = mat3(u_model_matrix * u_view_matrix) * normal;
    v_world_position = (u_model_matrix * u_view_matrix * vertPos4).xyz;
    ts_frag_pos = vec3(uModelViewMatrix * aVertexPosition);
        
    vec3 t = normalize(mat3(u_normal_matrix) * aVertexTangent);
    vec3 b = normalize(mat3(u_normal_matrix) * aVertexBitangent);
    vec3 n = normalize(mat3(u_normal_matrix) * aVertexNormal);
    mat3 tbn = transpose(mat3(t, b, n));

    vec3 light_pos = vec3(1, 2, 0);
    ts_light_pos = tbn * light_pos;
    ts_view_pos = tbn * vec3(0, 0, 0);
    ts_frag_pos = tbn * ts_frag_pos;

    vTextureCoord = aTextureCoord;

    
}