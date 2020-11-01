let exp = {}

function scale_image(imageData, context, d_x, d_y, scale) {
    let width = imageData.width
    let height = imageData.height
    context.clearRect(0, 0, width, height) // Clear the spot where it originated from
    for (let y = 0; y < height; y++) { // height original
        for (let x = 0; x < width; x++) { // width original
            // Gets original colour, then makes a scaled square of the same colour
            let index = (x + y * width) * 4;
            context.fillStyle = "rgba(" + imageData.data[index + 0] + ", " + imageData.data[index + 1] + ", " + imageData.data[index + 2] + ", " + imageData.data[index + 3] + ")"
            context.fillRect(d_x + x * scale, d_y + y * scale, scale, scale)
        }
    }
}

exp.draw_helmet = function (skin_canvas, model_ctx, scale) {
    // Helmet - Front
    model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model_ctx.drawImage(skin_canvas, 40 * scale, 8 * scale, 8 * scale, 8 * scale, 10 * scale, 13 / 1.2 * scale, 8 * scale, 8 * scale)
    // Helmet - Right
    model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0)
    model_ctx.drawImage(skin_canvas, 32 * scale, 8 * scale, 8 * scale, 8 * scale, 2 * scale, 3 / 1.2 * scale, 8 * scale, 8 * scale)
    // Helmet - Top
    model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0)
    model_ctx.scale(-1, 1)
    model_ctx.drawImage(skin_canvas, 40 * scale, 0, 8 * scale, 8 * scale, -3 * scale, 5 * scale, 8 * scale, 8 * scale)
}

exp.draw_head = function (skin_canvas, model_ctx, scale) {
    // Head - Front
    model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
    model_ctx.drawImage(skin_canvas, 8 * scale, 8 * scale, 8 * scale, 8 * scale, 10 * scale, 13 / 1.2 * scale, 8 * scale, 8 * scale)
    // Head - Right
    model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0)
    model_ctx.drawImage(skin_canvas, 0, 8 * scale, 8 * scale, 8 * scale, 2 * scale, 3 / 1.2 * scale, 8 * scale, 8 * scale)
    // Head - Top
    model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0)
    model_ctx.scale(-1, 1)
    model_ctx.drawImage(skin_canvas, 8 * scale, 0, 8 * scale, 8 * scale, -3 * scale, 5 * scale, 8 * scale, 8 * scale)
}

exp.draw_body = function (rid, skin_canvas, model_ctx, scale) {
    if (skin_canvas.height === 32 * scale) {
        // Left Leg
        // Left Leg - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.scale(-1, 1)
        model_ctx.drawImage(skin_canvas, 4 * scale, 20 * scale, 4 * scale, 12 * scale, -16 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale)

        // Right Leg
        // Right Leg - Right
        model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 0 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 26.4 / 1.2 * scale, 4 * scale, 12 * scale)
        // Right Leg - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 4 * scale, 20 * scale, 4 * scale, 12 * scale, 8 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale)

        // Arm Left
        // Arm Left - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.scale(-1, 1)
        model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, -20 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale)
        // Arm Left - Top
        model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0)
        model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, 0, 16 * scale, 4 * scale, 4 * scale)

        // Body
        // Body - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 20 * scale, 20 * scale, 8 * scale, 12 * scale, 8 * scale, 20 / 1.2 * scale, 8 * scale, 12 * scale)

        // Arm Right
        // Arm Right - Right
        model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 40 * scale, 20 * scale, 4 * scale, 12 * scale, 0, 16 / 1.2 * scale, 4 * scale, 12 * scale)
        // Arm Right - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale)
        // Arm Right - Top
        model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0)
        model_ctx.scale(-1, 1)
        model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, -16 * scale, 16 * scale, 4 * scale, 4 * scale)
    } else {
        // Left Leg
        // Left Leg - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 20 * scale, 52 * scale, 4 * scale, 12 * scale, 12 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale)

        // Right Leg
        // Right Leg - Right
        model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 0, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 26.4 / 1.2 * scale, 4 * scale, 12 * scale)
        // Right Leg - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 4 * scale, 20 * scale, 4 * scale, 12 * scale, 8 * scale, 34.4 / 1.2 * scale, 4 * scale, 12 * scale)

        // Arm Left
        // Arm Left - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 36 * scale, 52 * scale, 4 * scale, 12 * scale, 16 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale)
        // Arm Left - Top
        model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0)
        model_ctx.drawImage(skin_canvas, 36 * scale, 48 * scale, 4 * scale, 4 * scale, 0, 16 * scale, 4 * scale, 4 * scale)

        // Body
        // Body - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 20 * scale, 20 * scale, 8 * scale, 12 * scale, 8 * scale, 20 / 1.2 * scale, 8 * scale, 12 * scale)

        // Arm Right
        // Arm Right - Right
        model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 40 * scale, 20 * scale, 4 * scale, 12 * scale, 0, 16 / 1.2 * scale, 4 * scale, 12 * scale)
        // Arm Right - Front
        model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0)
        model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 20 / 1.2 * scale, 4 * scale, 12 * scale)
        // Arm Right - Top
        model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0)
        model_ctx.scale(-1, 1)
        model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, -16 * scale, 16 * scale, 4 * scale, 4 * scale)
    }
}

exp.draw_model = function (rid, img, scale, helm, body, callback) {
    let image = new Image()

    image.onerror = function (err) {
        console.log(rid, "render error:", err.stack)
        callback(err, null)
    }

    image.onload = function () {
        let width = 64 * scale
        let original_height = (image.height === 32 ? 32 : 64)
        let height = original_height * scale
        let model_canvas = document.createElement('canvas')
        model_canvas.width = 20 * scale
        model_canvas.height = (body ? 44.8 : 17.6) * scale
        let skin_canvas = document.createElement('canvas')
        skin_canvas.width = width
        skin_canvas.height = height
        let model_ctx = model_canvas.getContext("2d")
        let skin_ctx = skin_canvas.getContext("2d")

        skin_ctx.drawImage(image, 0, 0, 64, original_height)
        // Scale it
        scale_image(skin_ctx.getImageData(0, 0, 64, original_height), skin_ctx, 0, 0, scale)
        if (body) {
            exp.draw_body(rid, skin_canvas, model_ctx, scale)
        }
        exp.draw_head(skin_canvas, model_ctx, scale)
        if (helm) {
            exp.draw_helmet(skin_canvas, model_ctx, scale)
        }
        callback(null, model_canvas.toDataURL())

    }

    image.src = img
}