precision highp float;
precision highp sampler3D;

in vec3 vOrigin;
in vec3 vDirection;
in vec3 vPosition;
out vec4 color;

uniform float threshold;
uniform float threshold1;
uniform float depthSampleCount;

uniform sampler3D map;
uniform sampler2D colorMap;

uniform float brightness;

uniform float rangeColor1;
uniform float rangeColor2;

uniform float maxLat;
uniform float minLat;

uniform vec2 iResolution;

uniform vec2 xRange;
uniform vec2 yRange;

const float shininess = 40.0;

// float delta = 1.0 + tan(radians(float(minLat))) / tan(radians(float(maxLat)));

#define PI 3.141592653589793
#define QPI 0.7853981633974483

vec2 hitBox( vec3 orig, vec3 dir ) {
    const vec3 box_min = vec3( - 0.5 );
    const vec3 box_max = vec3( 0.5 );
    vec3 inv_dir = 1.0 / dir;
    vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
    vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
    vec3 tmin = min( tmin_tmp, tmax_tmp );
    vec3 tmax = max( tmin_tmp, tmax_tmp );
    float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
    float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
    return vec2( t0, t1 );
}

float latMercatorNormalize (float lat) {
    return ((180.0 / PI) * log(tan(QPI + (lat * PI) / 360.0))) / 360.0;
}

float sample1( vec3 p ) {
    // float delta = 1.0 + tan(radians(minLat)) / tan(radians(maxLat));
    p.y = (latMercatorNormalize(minLat + p.y * (maxLat - minLat)) - latMercatorNormalize(minLat)) / (latMercatorNormalize(maxLat) - latMercatorNormalize(minLat));
    return texture( map, p ).r;
}

// float sample1( vec3 p ) {
//     return texture( map, p ).r;
// }

// In weighted sum transparency the formula is

void main() {
    vec3 rayDir = normalize( vDirection );
    vec2 bounds = hitBox( vOrigin, rayDir );
    if ( bounds.x > bounds.y ) discard;
    bounds.x = max( bounds.x, 0.0 );
    vec3 p = vOrigin + bounds.x * rayDir;
    vec3 inc = 1.0 / abs( rayDir );
    vec4 pxColor = vec4(0.0);
    float delta = min( inc.x, min( inc.y, inc.z ) );
    delta /= depthSampleCount;

    float val = 0.0;
    float maxVal = 0.0;

    vec4 sumColor = vec4(1.0);
    float sumA = 0.0;
    float n = 0.0;


    for ( float t = bounds.x; t < bounds.y; t += delta ) {

        val = sample1( p + 0.5 );

        if (val > threshold && val < threshold1) {
            maxVal = max(maxVal, val);

            sumA += val;

            sumColor = sumColor + val * texture(colorMap, vec2((rangeColor2 - rangeColor1) * val + rangeColor1, 0.0));

            n = n + 1.0;
        }

        p += rayDir * delta;
    }

    // if(maxVal < 0.01 || maxVal > 0.99) {
    //     discard;
    // }

    vec4 colorMax = texture(colorMap, vec2((rangeColor2 - rangeColor1) * maxVal + rangeColor1, 0.0));

    vec3 colorW = sumColor.rgb / sumA;
    float avgA = sumA / n;
    float u = pow(1.0 - avgA, n);


    float limit = 0.5;
    if (maxVal > limit) {
        pxColor.rgb  = u * colorW + (1.0 - u) * colorMax.rgb;
        pxColor.a = pow( maxVal, 1.0/ 4.2 );
    } else {
        pxColor.rgb  = (1.0 - u) * colorW + u * colorMax.rgb;
        pxColor.a = pow(maxVal, 1.0/ 3.3);
    }

    // if (pxColor.r > 0.9 && pxColor.g > 0.9 && pxColor.b > 0.9) discard;

    color = pxColor * brightness;

    // grid range x and y

    vec2 np = p.xy + 0.5;

    np.y = (latMercatorNormalize(minLat + np.y * (maxLat - minLat)) - latMercatorNormalize(minLat)) / (latMercatorNormalize(maxLat) - latMercatorNormalize(minLat));

    vec2 xy = np * iResolution.xy;
    if ((xy.x >= xRange.r && xy.x <= xRange.g) && (xy.y >= yRange.r && xy.y <= yRange.g)) {
        color = vec4(1.0, 0.0, 0.0, 1.0) + color;
    }

    // grid 
    // vec3 np2 = p;
    // np2.y = (latMercatorNormalize(minLat + np2.y * (maxLat - minLat)) - latMercatorNormalize(minLat)) / (latMercatorNormalize(maxLat) - latMercatorNormalize(minLat));

    // vec2 xy2 = floor(np2.xy * iResolution.xy);
    // vec2 mn = smoothstep(0.1, 0.4, abs(np2.xy * iResolution.xy - xy2));

    // if ((mn.x < 0.2 || mn.y < 0.2) && np2.z < 0.001) {
    //     color = vec4(1.0, 0.0, 0.0, 1.0) + color;
    // }

    if ( color.a == 0.0 ) discard;
}
