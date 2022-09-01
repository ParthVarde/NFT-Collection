export default function handler(req, res) {
    const tokenId = req.query.tokenId;
    const image_url = "https://github.com/ParthVarde/NFT-Collection/tree/main/my-app/public/cryptodevs/";
    res.status(200).json({
        name: "Crypto Dev#" + tokenId,
        description: "Crypto Dev is a collection of developers in crypto",
        image: image_url + tokenId + ".svg"
    });
}