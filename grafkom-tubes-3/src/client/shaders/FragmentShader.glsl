precision mediump float;

varying vec3 normalInterp;  // Surface normal
varying vec3 vertPos;       // Vertex position
varying vec4 v_color;
varying highp vec2 v_uv;
varying vec3 v_world_normal;
varying vec3 v_world_position;
varying vec3 ts_light_pos;
varying vec3 ts_view_pos;
varying vec3 ts_frag_pos;
varying highp vec2 vTextureCoord;

uniform int mode;   // Rendering mode
uniform int shading;
uniform int texture_mode; // texture_mode { 0 : image, 1 : bump, 2: environment }
uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient
uniform float shininessVal; // Shininess
// Material color
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform vec3 lightPos; // Light position
uniform samplerCube u_texture;
uniform sampler2D u_sampler;
uniform vec3 u_world_camera_position;
varying vec2 frag_uv;

precision highp float;
// All variables for Environment Mapping
// Passed in from the vertex shader.
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
uniform sampler2D tex_norm;
uniform sampler2D tex_diffuse;
uniform sampler2D tex_depth;

// The texture
uniform samplerCube uTexture;

// The position of the camera
uniform vec3 uWorldCameraPosition;
uniform int textureType2;

// All variables for Texture Mapping
varying highp vec3 vLighting;
uniform sampler2D uSampler;
uniform bool uShading;

void main() {
  vec3 N = normalize(normalInterp);
  vec3 L = normalize(lightPos - vertPos);

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-vertPos); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, shininessVal);
  }
  if(shading == 0){
    gl_FragColor = vec4(vec3(v_color), 1.0);
  }
  else if(texture_mode == 1){
    gl_FragColor = texture2D(u_sampler, v_uv);
  } 
  else if(texture_mode == 2) {
    vec3 world_normal = normalize(v_world_normal);
    vec3 surface_distance = normalize(v_world_position - u_world_camera_position);
    vec3 direction = reflect(surface_distance, world_normal);
    gl_FragColor = textureCube(u_texture, direction);

  }
  else if (texture_mode == 3) {
    vec3 light_dir = N;
    vec3 view_dir = L;

    float depth = texture2D(u_sampler, v_uv).r;    
    vec2 p = view_dir.xy * (depth * 0.1) / view_dir.z;

    vec3 albedo = texture2D(u_sampler, v_uv).rgb;
    vec3 ambient = 0.5 * albedo;
    vec3 norm = normalize(texture2D(u_sampler, (v_uv - p)).rgb * 2.0 - 1.0);
    float diffuse = max(dot(light_dir, norm), 0.0);
    gl_FragColor = vec4(diffuse * albedo + ambient, 1.0);
  }
}