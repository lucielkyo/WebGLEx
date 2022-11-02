export const matrix3 = {
  multiply: (a, b, ...rest) => {
    const multiplication = [
    a[0]*b[0] + a[3]*b[1] + a[6]*b[2], /**/ a[1]*b[0] + a[4]*b[1] + a[7]*b[2], /**/ a[2]*b[0] + a[5]*b[1] + a[8]*b[2],
    a[0]*b[3] + a[3]*b[4] + a[6]*b[5], /**/ a[1]*b[3] + a[4]*b[4] + a[7]*b[5], /**/ a[2]*b[3] + a[5]*b[4] + a[8]*b[5],
    a[0]*b[6] + a[3]*b[7] + a[6]*b[8], /**/ a[1]*b[6] + a[4]*b[7] + a[7]*b[8], /**/ a[2]*b[6] + a[5]*b[7] + a[8]*b[8],
    ];

    if(rest.length === 0) return multiplication;
    return matrix3.multiply(multiplication, ...rest);
  },

  // a直 * b橫
  // [ 0 1 2  [ 0 1 2
  //   3 4 5    3 4 5 
  //   6 7 8]   6 7 8]

//平移
  translate: (x, y) =>([
    1, 0, 0,
    0, 1, 0,
    x, y, 1
    ]),

//縮放
  scale: (sx, sy) =>([
    sx, 0, 0,
    0, sy, 0,
    0,  0, 1
    ]),

//投影矩陣的產生 matrix3.projection()，為平移與縮放相乘
//position / u_resolution * vec2(2, -2) 縮放 + vec2(-1, 1) 平移

//記得矩陣運算與一般運算運算不同，向量放在最右邊，向左運算，
//因此 matrix3.translate(-1, 1) 雖然放在前面，但是其 transform 是在 matrix3.translate(-1, 1) 之後的

  projection: (width, height) =>(
    matrix3.multiply(
      matrix3.translate(-1,1), 
      matrix3.scale( 2/width, -2/height )
    )
  ),

//旋轉
  rotate: rad => {
    const c = Math.cos(rad), s = Math.sin(rad);
    return[
      c,  s, 0,
      -s, c, 0,
      0,  0, 1
    ]
  },
  //[Math.cos(rad),  Math.sin(rad), 0,
  //-Math.sin(rad), Math.cos(rad), 0,
  //0,              0,             1]

//取消效果用的單位矩陣
  identity: () =>([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ])
};

export const matrix4 = {
  multiply: (a, b, ...rest) => {
    const multiplication = [
    a[0]*b[0] + a[4]*b[1] + a[8]*b[2] + a[12]*b[3], /**/ a[1]*b[0] + a[5]*b[1] + a[9]*b[2] + a[13]*b[3], /**/ a[2]*b[0] + a[6]*b[1] + a[10]*b[2] + a[14]*b[3], /**/ a[3]*b[0] + a[7]*b[1] + a[11]*b[2] + a[15]*b[3],
    a[0]*b[4] + a[4]*b[5] + a[8]*b[6] + a[12]*b[7], /**/ a[1]*b[4] + a[5]*b[5] + a[9]*b[6] + a[13]*b[7], /**/ a[2]*b[4] + a[6]*b[5] + a[10]*b[6] + a[14]*b[7], /**/ a[3]*b[4] + a[7]*b[5] + a[11]*b[6] + a[15]*b[7],
    a[0]*b[8] + a[4]*b[9] + a[8]*b[10] + a[12]*b[11], /**/ a[1]*b[8] + a[5]*b[9] + a[9]*b[10] + a[13]*b[11], /**/ a[2]*b[8] + a[6]*b[9] + a[10]*b[10] + a[14]*b[11], /**/ a[3]*b[8] + a[7]*b[9] + a[11]*b[10] + a[15]*b[11],
    a[0]*b[12] + a[4]*b[13] + a[8]*b[14] + a[12]*b[15], /**/ a[1]*b[12] + a[5]*b[13] + a[9]*b[14] + a[13]*b[15], /**/ a[2]*b[12] + a[6]*b[13] + a[10]*b[14] + a[14]*b[15], /**/ a[3]*b[12] + a[7]*b[13] + a[11]*b[14] + a[15]*b[15],
    ];

    if(rest.length === 0) return multiplication;
    return matrix4.multiply(multiplication, ...rest);
  },
  // a直 * b橫
  // [ 0 1 2 3  [ 0 1 2 3
  //   4 5 6 7    4 5 6 7
  //   8 9 1011   8 9 1011
  //   12131415]  12131415]

  //取消效果用的單位矩陣
  identity: () =>([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]),

  projection: (width, height, depth) =>([
    2 / width, 0, 0, 0,
    0, -2 / height, 0, 0,
    0, 0, 2 / depth, 0,
    -1, 1, 0, 1,
  ]),

  //平移
  translate: (tx, ty, tz) =>([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1
  ]),

//縮放
  scale: (sx, sy) =>([
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0,  sz, 0,
    0,  0, 0, 1
  ]),


//旋轉
  rotateX: radX => {
    const c = Math.cos(radX), s = Math.sin(radX);
    return[
      1,  0, 0, 0,
      0,  c, s, 0,
      0, -s, c, 0,
      0,  0, 0, 1
    ]
  },
  rotateY: radY => {
    const c = Math.cos(radY), s = Math.sin(radY);
    return[
      c, 0,-s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ]
  },
  rotateX: radZ => {
    const c = Math.cos(radZ), s = Math.sin(radZ);
    return[
      c,  s, 0, 0,
     -s,  c, 0, 0,
      0,  0, 1, 0,
      0,  0, 0, 1
    ]
  },
}