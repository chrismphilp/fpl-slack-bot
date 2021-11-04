const createErrorMessage = (message) => ({
    response_type: "ephemeral",
    text: message,
});

module.exports = {
    createErrorMessage,
}
